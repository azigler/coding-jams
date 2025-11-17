"""Deterministic SQL repair tools for common error patterns."""

from __future__ import annotations

import re
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class SQLRepairTool:
    """Tool for repairing SQL queries based on error patterns."""
    
    @staticmethod
    def repair_date_conversion(sql: str, error_msg: str) -> Optional[str]:
        """
        Repair date conversion errors: date_sk columns are INTEGER, not DATE.
        Also handles cases where wrong columns are used with date strings.
        
        Patterns:
        - ss_sold_date_sk BETWEEN '2022-10-01' AND '2022-11-30'
        - ss_sales_price BETWEEN '2022-10-01' (WRONG - sales_price is numeric)
        - ss_item_sk BETWEEN '2022-11-01' (WRONG - item_sk is integer)
        
        Returns:
            Repaired SQL or None if not applicable
        """
        if not ("Conversion Error" in error_msg or "Could not convert string" in error_msg):
            return None
        
        # Extract the problematic line from error
        line_match = re.search(r'LINE\s+\d+:\s*(.+?)(?:\n|$)', error_msg, re.IGNORECASE)
        if not line_match:
            return None
        
        problem_line = line_match.group(1)
        
        # Check if it's a date string being used on wrong column
        # Pattern: column BETWEEN 'YYYY-MM-DD' or column = 'YYYY-MM-DD'
        wrong_date_pattern = r'(\w+\.\w+|\w+)\s+(?:BETWEEN|>=|<=|=)\s+\'(\d{4}-\d{2}-\d{2})\''
        wrong_match = re.search(wrong_date_pattern, problem_line, re.IGNORECASE)
        
        if wrong_match:
            wrong_column = wrong_match.group(1)
            date_str = wrong_match.group(2)
            
            # Check if this is a known non-date column being used with dates
            non_date_columns = {
                'ss_sales_price', 'ws_sales_price', 'cs_sales_price',
                'ss_item_sk', 'ws_item_sk', 'cs_item_sk',
                'ss_store_sk', 'ss_customer_sk',
            }
            
            # Extract column name (handle table.column format)
            col_name = wrong_column.split('.')[-1] if '.' in wrong_column else wrong_column
            
            if col_name in non_date_columns:
                # This is wrong - find the correct date column for this table
                table_prefix = wrong_column.split('.')[0] if '.' in wrong_column else ''
                
                # Map to correct date column
                date_column_map = {
                    'ss': 'ss_sold_date_sk',
                    'ws': 'ws_sold_date_sk',
                    'cs': 'cs_sold_date_sk',
                    'sr': 'sr_returned_date_sk',
                }
                
                if table_prefix in date_column_map:
                    correct_date_col = date_column_map[table_prefix]
                    if '.' in wrong_column:
                        correct_date_col = f"{table_prefix}.{correct_date_col}"
                    
                    # Replace the wrong column with correct date column
                    sql = re.sub(
                        re.escape(wrong_column),
                        correct_date_col,
                        sql,
                        flags=re.IGNORECASE
                    )
                    logger.info(f"[REPAIR] Fixed wrong column in date comparison: {wrong_column} → {correct_date_col}")
                    # Continue processing with the fixed SQL (don't recurse)
        
        if "_date_sk" not in sql and "_sold_date_sk" not in sql and "_returned_date_sk" not in sql:
            return None
        
        repaired = sql
        
        # Pattern 1: BETWEEN date strings
        date_sk_pattern = r"(\w+\.)?(ss_sold_date_sk|sr_returned_date_sk|ws_sold_date_sk|cs_sold_date_sk)\s+BETWEEN\s+'(\d{4})-(\d{2})-(\d{2})'\s+AND\s+'(\d{4})-(\d{2})-(\d{2})'"
        match = re.search(date_sk_pattern, sql, re.IGNORECASE)
        
        if match:
            alias_prefix = match.group(1).rstrip('.') if match.group(1) else None
            date_col = match.group(2)
            year1, month1 = int(match.group(3)), int(match.group(4))
            year2, month2 = int(match.group(6)), int(match.group(7))
            
            # Build date_dim condition
            if year1 == year2:
                months = list(range(month1, month2 + 1))
                months_str = ', '.join(map(str, months))
                date_condition = f"d.d_year = {year1} AND d.d_moy IN ({months_str})"
            else:
                date_condition = f"((d.d_year = {year1} AND d.d_moy >= {month1}) OR (d.d_year = {year2} AND d.d_moy <= {month2}))"
            
            # Add JOIN if not present
            if "JOIN date_dim" not in sql.upper():
                from_match = re.search(r'FROM\s+(\w+)(?:\s+AS\s+)?(\w+)?', sql, re.IGNORECASE)
                if from_match:
                    table = from_match.group(1)
                    alias = from_match.group(2) or alias_prefix or table[:2]
                    join_clause = f"JOIN date_dim d ON {alias}.{date_col} = d.d_date_sk"
                    
                    if "WHERE" in sql.upper():
                        repaired = re.sub(r'(\s+WHERE\s+)', f' {join_clause}\\1', repaired, flags=re.IGNORECASE, count=1)
                    else:
                        repaired = re.sub(r'(FROM\s+\w+(?:\s+AS\s+)?\w+)', rf'\1 {join_clause}', repaired, flags=re.IGNORECASE, count=1)
            
            # Replace BETWEEN clause
            if "WHERE" in repaired.upper():
                replacement = f"AND {date_condition}"
            else:
                replacement = f"WHERE {date_condition}"
            
            repaired = re.sub(date_sk_pattern, replacement, repaired, flags=re.IGNORECASE)
            repaired = re.sub(r'\s+WHERE\s+AND\s+', ' WHERE ', repaired, flags=re.IGNORECASE)
            repaired = re.sub(r'\s+AND\s+WHERE\s+', ' WHERE ', repaired, flags=re.IGNORECASE)
            
            logger.info(f"[REPAIR] Fixed date BETWEEN: {date_col} → date_dim JOIN")
            return repaired
        
        # Pattern 2: >= and <= date strings
        gte_pattern = r"(\w+\.)?(ss_sold_date_sk|sr_returned_date_sk)\s*>=\s*'(\d{4})-(\d{2})-(\d{2})'"
        lte_pattern = r"(\w+\.)?(ss_sold_date_sk|sr_returned_date_sk)\s*<=\s*'(\d{4})-(\d{2})-(\d{2})'"
        
        gte_match = re.search(gte_pattern, sql, re.IGNORECASE)
        lte_match = re.search(lte_pattern, sql, re.IGNORECASE)
        
        if gte_match or lte_match:
            # Similar logic but for >= and <=
            # Convert to BETWEEN format and process
            if gte_match and lte_match:
                date_col = gte_match.group(2) or lte_match.group(2)
                start_date = gte_match.group(3) + '-' + gte_match.group(4) + '-' + gte_match.group(5)
                end_date = lte_match.group(3) + '-' + lte_match.group(4) + '-' + lte_match.group(5)
                # Replace >= and <= with BETWEEN
                sql = re.sub(
                    rf'{re.escape(date_col)}\s*>=\s*\'{re.escape(start_date)}\'\s+AND\s+{re.escape(date_col)}\s*<=\s*\'{re.escape(end_date)}\'',
                    f"{date_col} BETWEEN '{start_date}' AND '{end_date}'",
                    sql,
                    flags=re.IGNORECASE
                )
                # Now process the BETWEEN pattern (which should match now)
                # Fall through to the BETWEEN pattern matching above
        
        # If we got here and repaired != sql, return it
        if repaired != sql:
            return repaired
        
        return None
    
    @staticmethod
    def repair_year_function(sql: str, error_msg: str) -> Optional[str]:
        """
        Repair YEAR() function on INTEGER columns.
        
        Pattern: YEAR(ss_sold_date_sk) = 2022
        → JOIN date_dim d ON ss.ss_sold_date_sk = d.d_date_sk WHERE d.d_year = 2022
        """
        if "No function matches" not in error_msg or "year(INTEGER)" not in error_msg.lower():
            return None
        
        year_pattern = r"YEAR\s*\(\s*(\w+\.)?(ss_sold_date_sk|sr_returned_date_sk)\s*\)\s*=\s*(\d{4})"
        match = re.search(year_pattern, sql, re.IGNORECASE)
        
        if match:
            alias_prefix = match.group(1).rstrip('.') if match.group(1) else None
            date_col = match.group(2)
            year = match.group(3)
            
            # Add JOIN if not present
            if "JOIN date_dim" not in sql.upper():
                from_match = re.search(r'FROM\s+(\w+)(?:\s+AS\s+)?(\w+)?', sql, re.IGNORECASE)
                if from_match:
                    table = from_match.group(1)
                    alias = from_match.group(2) or alias_prefix or table[:2]
                    join_clause = f"JOIN date_dim d ON {alias}.{date_col} = d.d_date_sk"
                    
                    if "WHERE" in sql.upper():
                        sql = re.sub(r'(\s+WHERE\s+)', f' {join_clause}\\1', sql, flags=re.IGNORECASE, count=1)
                    else:
                        sql = re.sub(r'(FROM\s+\w+(?:\s+AS\s+)?\w+)', rf'\1 {join_clause}', sql, flags=re.IGNORECASE, count=1)
            
            # Replace YEAR() with d.d_year
            repaired = re.sub(year_pattern, f"d.d_year = {year}", sql, flags=re.IGNORECASE)
            logger.info(f"[REPAIR] Fixed YEAR() function: → date_dim JOIN with d.d_year")
            return repaired
        
        return None
    
    @staticmethod
    def repair_column_binding(sql: str, error_msg: str) -> Optional[str]:
        """
        Repair column binding errors using MCP candidate bindings.
        
        Pattern: "Referenced column "X" not found! Candidate bindings: "Y", "Z""
        """
        if "Candidate bindings" not in error_msg:
            return None
        
        # Extract incorrect column and candidates
        incorrect_match = re.search(r'column named "([^"]+)"', error_msg, re.IGNORECASE)
        candidate_match = re.search(r'Candidate bindings[:\s]+([^\n]+)', error_msg, re.IGNORECASE)
        
        if incorrect_match and candidate_match:
            incorrect = incorrect_match.group(1)
            candidates_str = candidate_match.group(1)
            candidates = re.findall(r'"([^"]+)"', candidates_str)
            
            if candidates:
                correct = candidates[0]  # Use first candidate
                # Replace whole word only
                pattern = re.compile(r'\b' + re.escape(incorrect) + r'\b', re.IGNORECASE)
                repaired = pattern.sub(correct, sql)
                logger.info(f"[REPAIR] Fixed column binding: {incorrect} → {correct}")
                return repaired
        
        return None
    
    @staticmethod
    def repair_table_not_found(sql: str, error_msg: str) -> Optional[str]:
        """
        Repair table not found errors.
        
        Patterns:
        - "Table 'X' does not exist"
        - "Referenced table 'X' not found"
        """
        if "table" not in error_msg.lower() or "not found" not in error_msg.lower():
            return None
        
        # Extract table name
        table_match = re.search(r'table[:\s]+"?([^"\s]+)"?', error_msg, re.IGNORECASE)
        if not table_match:
            return None
        
        table_name = table_match.group(1)
        
        # Common table name corrections
        table_corrections = {
            'ss': 'store_sales',
            'sr': 'store_returns',
            'ws': 'web_sales',
            'cs': 'catalog_sales',
            'i': 'item',
            's': 'store',
            'w': 'warehouse',
            'd': 'date_dim',
            'c': 'customer',
        }
        
        # Check if it's an alias issue
        if table_name in table_corrections:
            correct_table = table_corrections[table_name]
            # Replace alias references with full table name
            # This is tricky - we need to find WHERE the alias is used incorrectly
            # For now, just log it
            logger.warning(f"[REPAIR] Table alias '{table_name}' might need to be '{correct_table}'")
            # Could add logic to replace FROM clause aliases
        
        return None
    
    @staticmethod
    def repair_join_column_error(sql: str, error_msg: str) -> Optional[str]:
        """
        Repair JOIN column errors where wrong columns are used in JOIN conditions.
        
        Pattern: "Table 'ss' does not have a column named 'i_item_sk'" with Candidate bindings
        This happens when JOIN uses wrong column names like: ss.i_item_sk instead of ss.ss_item_sk
        """
        if "does not have a column named" not in error_msg.lower():
            return None
        
        # Extract table name and wrong column
        table_match = re.search(r'Table\s+"?(\w+)"?\s+does not have a column named\s+"?(\w+)"?', error_msg, re.IGNORECASE)
        if not table_match:
            return None
        
        table_alias = table_match.group(1)
        wrong_column = table_match.group(2)
        
        # Extract candidate bindings if available
        candidate_match = re.search(r'Candidate bindings[:\s]+([^\n]+)', error_msg, re.IGNORECASE)
        if candidate_match:
            candidates_str = candidate_match.group(1)
            candidates = re.findall(r'"([^"]+)"', candidates_str)
            
            if candidates:
                correct_column = candidates[0]
                # Find the JOIN clause with this wrong column
                # Pattern: JOIN table alias ON wrong_table.wrong_column = ...
                join_pattern = rf'JOIN\s+\w+\s+{re.escape(table_alias)}\s+ON\s+{re.escape(table_alias)}\.{re.escape(wrong_column)}'
                match = re.search(join_pattern, sql, re.IGNORECASE)
                
                if match:
                    # Replace the wrong column with correct one
                    repaired = re.sub(
                        rf'{re.escape(table_alias)}\.{re.escape(wrong_column)}',
                        f'{table_alias}.{correct_column}',
                        sql,
                        flags=re.IGNORECASE
                    )
                    logger.info(f"[REPAIR] Fixed JOIN column: {table_alias}.{wrong_column} → {table_alias}.{correct_column}")
                    return repaired
                
                # Also check if it's the other side of the JOIN
                # Pattern: ... = table_alias.wrong_column
                join_pattern2 = rf'{re.escape(table_alias)}\.{re.escape(wrong_column)}'
                if re.search(join_pattern2, sql, re.IGNORECASE):
                    repaired = re.sub(
                        rf'{re.escape(table_alias)}\.{re.escape(wrong_column)}',
                        f'{table_alias}.{correct_column}',
                        sql,
                        flags=re.IGNORECASE
                    )
                    logger.info(f"[REPAIR] Fixed JOIN column (other side): {table_alias}.{wrong_column} → {table_alias}.{correct_column}")
                    return repaired
        
        return None
    
    @staticmethod
    def repair_missing_join(sql: str, error_msg: str) -> Optional[str]:
        """
        Repair missing JOIN errors.
        
        Pattern: "Referenced column 'X.Y' not found" where X is not in FROM clause
        """
        if "referenced column" not in error_msg.lower() or "not found" in error_msg.lower():
            return None
        
        # Extract column reference like "i.i_category"
        col_ref_match = re.search(r'column[:\s]+"?(\w+)\.(\w+)"?', error_msg, re.IGNORECASE)
        if not col_ref_match:
            return None
        
        table_alias = col_ref_match.group(1)
        column = col_ref_match.group(2)
        
        # Check if table is already in FROM
        if table_alias.upper() in sql.upper():
            # Might be a JOIN issue
            # Common JOIN patterns
            join_patterns = {
                'i': ('item', 'i_item_sk'),
                's': ('store', 's_store_sk'),
                'w': ('warehouse', 'w_warehouse_sk'),
                'd': ('date_dim', 'd_date_sk'),
            }
            
            if table_alias.lower() in join_patterns:
                table_name, join_key = join_patterns[table_alias.lower()]
                # Try to add JOIN
                # This is complex - would need to understand the query structure
                logger.warning(f"[REPAIR] Might need JOIN {table_name} {table_alias} ON ...")
        
        return None
    
    @staticmethod
    def repair_string_literal(sql: str, error_msg: str) -> Optional[str]:
        """
        Repair string literal issues (double quotes → single quotes).
        """
        # Replace double quotes with single quotes for string literals
        # Pattern: "value" in WHERE/ON clauses (but not table/column names)
        # This is tricky - we want to replace "value" but not "table_name"
        
        # Simple heuristic: replace "value" in WHERE/ON/AND/OR contexts
        # But be careful not to break table/column names
        
        # For now, just fix obvious cases
        if '"' in sql:
            # Replace double quotes around numbers or common string patterns
            repaired = re.sub(r'"(\d+)"', r"'\1'", sql)  # "5" → '5'
            repaired = re.sub(r'"([A-Z][a-z]+)"', r"'\1'", repaired)  # "Electronics" → 'Electronics'
            
            if repaired != sql:
                logger.info("[REPAIR] Fixed string literals: double → single quotes")
                return repaired
        
        return None
    
    @staticmethod
    def repair_type_cast_error(sql: str, error_msg: str) -> Optional[str]:
        """
        Repair type casting errors in aggregate functions.
        
        Pattern: "No function matches the given name and argument types 'sum(VARCHAR)'"
        """
        if "No function matches" not in error_msg or "sum(" not in error_msg.lower():
            return None
        
        # Extract the problematic function and column
        func_match = re.search(r'(SUM|AVG|MAX|MIN|COUNT)\s*\(\s*(\w+\.\w+|\w+)\s*\)', error_msg, re.IGNORECASE)
        if not func_match:
            return None
        
        func_name = func_match.group(1).upper()
        column = func_match.group(2)
        
        # Check if it's a VARCHAR/string column being aggregated
        # Common string columns that shouldn't be aggregated
        string_columns = {
            'w_city', 'w_state', 'w_country', 'w_zip',
            's_city', 's_state', 's_country', 's_zip',
            'i_category', 'i_brand', 'i_color', 'i_size',
        }
        
        col_name = column.split('.')[-1] if '.' in column else column
        
        if col_name in string_columns:
            # Remove the aggregate function, just select the column
            # Or change to COUNT if it's COUNT, or remove if it's SUM/AVG
            if func_name == 'COUNT':
                # COUNT on string is fine, but might need DISTINCT
                repaired = re.sub(
                    rf'{func_name}\s*\(\s*{re.escape(column)}\s*\)',
                    f'COUNT(DISTINCT {column})',
                    sql,
                    flags=re.IGNORECASE
                )
            else:
                # Remove aggregate, just select column
                repaired = re.sub(
                    rf'{func_name}\s*\(\s*{re.escape(column)}\s*\)',
                    column,
                    sql,
                    flags=re.IGNORECASE
                )
            logger.info(f"[REPAIR] Fixed type cast: {func_name}({column}) → {column if func_name != 'COUNT' else 'COUNT(DISTINCT ' + column + ')'}")
            return repaired
        
        return None
    
    @staticmethod
    def repair_table_not_found_enhanced(sql: str, error_msg: str) -> Optional[str]:
        """
        Enhanced table not found repair with MCP suggestions.
        
        Pattern: "Table with name X does not exist! Did you mean Y?"
        """
        if "table" not in error_msg.lower() or "does not exist" not in error_msg.lower():
            return None
        
        # Extract table name and suggestion
        table_match = re.search(r'table[:\s]+"?([^"\s]+)"?', error_msg, re.IGNORECASE)
        suggestion_match = re.search(r'Did you mean\s+"?([^"?\s]+)"?', error_msg, re.IGNORECASE)
        
        if table_match and suggestion_match:
            wrong_table = table_match.group(1)
            correct_table = suggestion_match.group(1)
            
            # Replace in SQL (whole word, case-insensitive)
            pattern = re.compile(r'\b' + re.escape(wrong_table) + r'\b', re.IGNORECASE)
            repaired = pattern.sub(correct_table, sql)
            
            logger.info(f"[REPAIR] Fixed table name: {wrong_table} → {correct_table}")
            return repaired
        
        return None
    
    @staticmethod
    def repair_missing_from_clause(sql: str, error_msg: str) -> Optional[str]:
        """
        Repair missing FROM clause errors and alias mismatches.
        
        Pattern: "Referenced table 'X' not found!" when table is in SELECT but not in FROM
        Also handles: "Referenced table 'inv' not found! Candidate tables: 'inv_nov', 'inv_oct'"
        """
        if "referenced table" not in error_msg.lower() or "not found" not in error_msg.lower():
            return None
        
        # Extract table name from error
        table_match = re.search(r'referenced table\s+"?(\w+)"?\s+not found', error_msg, re.IGNORECASE)
        if not table_match:
            return None
        
        missing_table = table_match.group(1)
        
        # Check for candidate tables (alias mismatch)
        candidate_match = re.search(r'candidate tables[:\s]+([^\n]+)', error_msg, re.IGNORECASE)
        if candidate_match:
            candidates_str = candidate_match.group(1)
            candidates = re.findall(r'"([^"]+)"', candidates_str)
            
            if candidates:
                # This is likely an alias mismatch - SELECT uses 'inv' but FROM uses 'inv_nov'
                # Find which candidate is actually in FROM clause
                sql_upper = sql.upper()
                from_clause = sql_upper.split("FROM")[1] if "FROM" in sql_upper else ""
                
                # Find which candidate appears in FROM clause
                for candidate in candidates:
                    if candidate.upper() in from_clause:
                        # Replace missing_table with candidate in SELECT clause
                        select_clause = sql_upper.split("FROM")[0]
                        if missing_table.upper() in select_clause:
                            # Replace in original SQL (preserve case)
                            # Use word boundary to avoid partial matches
                            repaired = re.sub(
                                rf'\b{re.escape(missing_table)}\.',
                                f'{candidate}.',
                                sql,
                                flags=re.IGNORECASE
                            )
                            logger.info(f"[REPAIR] Fixed alias mismatch: {missing_table} → {candidate}")
                            return repaired
                
                # If no candidate found in FROM, use first candidate (heuristic)
                if candidates:
                    candidate = candidates[0]
                    select_clause = sql_upper.split("FROM")[0]
                    if missing_table.upper() in select_clause:
                        repaired = re.sub(
                            rf'\b{re.escape(missing_table)}\.',
                            f'{candidate}.',
                            sql,
                            flags=re.IGNORECASE
                        )
                        logger.info(f"[REPAIR] Fixed alias mismatch (using first candidate): {missing_table} → {candidate}")
                        return repaired
        
        # Original logic for missing FROM
        sql_upper = sql.upper()
        select_clause = sql_upper.split("FROM")[0] if "FROM" in sql_upper else sql_upper
        from_clause = sql_upper.split("FROM")[1] if "FROM" in sql_upper else ""
        
        # Check if table is in SELECT but not in FROM
        if missing_table.upper() in select_clause and missing_table.upper() not in from_clause:
            # Common table name mappings
            table_mappings = {
                'warehouse': 'warehouse w',
                'item': 'item i',
                'store': 'store s',
                'inventory': 'inventory inv',
                'date_dim': 'date_dim d',
            }
            
            table_lower = missing_table.lower()
            if table_lower in table_mappings:
                # Try to add the table to FROM clause
                # Find WHERE clause position
                where_pos = sql_upper.find("WHERE")
                if where_pos > 0:
                    # Insert before WHERE
                    insert_pos = where_pos
                    new_from = f" JOIN {table_mappings[table_lower]}"
                    # Try to find a reasonable JOIN condition
                    if table_lower == 'warehouse' and 'inventory' in from_clause:
                        new_from += " ON inv.inv_warehouse_sk = w.w_warehouse_sk"
                    elif table_lower == 'item' and 'inventory' in from_clause:
                        new_from += " ON inv.inv_item_sk = i.i_item_sk"
                    elif table_lower == 'item' and 'store_sales' in from_clause:
                        new_from += " ON ss.ss_item_sk = i.i_item_sk"
                    elif table_lower == 'warehouse' and 'inventory' in from_clause:
                        new_from += " ON inv.inv_warehouse_sk = w.w_warehouse_sk"
                    
                    repaired = sql[:insert_pos] + new_from + " " + sql[insert_pos:]
                    logger.info(f"[REPAIR] Added missing FROM/JOIN for table: {missing_table}")
                    return repaired
        
        return None
    
    @staticmethod
    def repair_scalar_subquery(sql: str, error_msg: str) -> Optional[str]:
        """
        Repair scalar subquery errors (returning multiple rows).
        
        Pattern: "More than one row returned by a subquery used as an expression"
        """
        if "more than one row" not in error_msg.lower() or "subquery" not in error_msg.lower():
            return None
        
        # Find subqueries in SELECT or WHERE clauses
        # Pattern: (SELECT ...)
        subquery_pattern = r'\(\s*SELECT\s+([^)]+)\s+FROM\s+([^)]+)\s*(?:WHERE\s+([^)]+))?\s*\)'
        
        # This is complex - would need to identify which subquery is problematic
        # and add LIMIT 1 or aggregation
        
        logger.warning("[REPAIR] Scalar subquery issue detected - may need LIMIT 1 or aggregation")
        return None
    
    @staticmethod
    def repair_all(sql: str, error_msg: str) -> Optional[str]:
        """
        Try all repair tools in order until one succeeds.
        
        Returns:
            Repaired SQL or None if no repair succeeded
        """
        repair_tools = [
            SQLRepairTool.repair_missing_from_clause,  # Fix missing FROM when table referenced in SELECT
            SQLRepairTool.repair_column_binding,  # Try MCP bindings first
            SQLRepairTool.repair_join_column_error,  # JOIN column name errors (ss.i_item_sk → ss.ss_item_sk)
            SQLRepairTool.repair_table_not_found_enhanced,  # MCP table suggestions
            SQLRepairTool.repair_type_cast_error,  # SUM(VARCHAR) errors
            SQLRepairTool.repair_date_conversion,  # Date conversion (handles wrong columns too)
            SQLRepairTool.repair_year_function,
            SQLRepairTool.repair_string_literal,
            SQLRepairTool.repair_table_not_found,
            SQLRepairTool.repair_missing_join,
            SQLRepairTool.repair_scalar_subquery,
        ]
        
        for tool in repair_tools:
            try:
                repaired = tool(sql, error_msg)
                if repaired and repaired != sql:
                    return repaired
            except Exception as e:
                logger.warning(f"Repair tool {tool.__name__} failed: {e}")
                continue
        
        return None


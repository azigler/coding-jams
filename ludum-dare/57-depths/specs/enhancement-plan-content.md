# Content Generation Enhancement

## Overview

Procedurally generate vast amounts of believable but absurd corporate content to create a rich, varied game experience with high replayability.

## Enhancement Goals

- Create realistic but humorous corporate file structures
- Generate varied and contextually appropriate content
- Ensure consistent naming and metadata
- Support multiple corporate departments and projects
- Enable content variation while maintaining coherence

## Phase 1: Content Templates (2 hours)

### 1. File Type System (45 min)

```typescript
export interface FileTemplate {
  extension: string;
  namePatterns: string[];
  contentType: 'document' | 'spreadsheet' | 'presentation' | 'image';
  metadata?: Record<string, string>;
}

export class FileTypes {
  static readonly TEMPLATES: Record<string, FileTemplate> = {
    document: {
      extension: '.doc',
      namePatterns: [
        'Report_{DATE}',
        'Minutes_{DATE}',
        'Proposal_v{VERSION}'
      ],
      contentType: 'document'
    },
    spreadsheet: {
      extension: '.xls',
      namePatterns: [
        'Budget_{YEAR}',
        'Forecast_{QUARTER}',
        'Data_Analysis_{DATE}'
      ],
      contentType: 'spreadsheet'
    }
  };
}
```

### 2. Name Generator (45 min)

```typescript
export class ContentNameGenerator {
  static generateFileName(template: FileTemplate): string {
    const pattern = this.selectPattern(template.namePatterns);
    return this.fillTemplate(pattern) + template.extension;
  }
  
  private static fillTemplate(pattern: string): string {
    // Replace {DATE}, {VERSION}, etc with values
    // Add employee initials
    // Include project codes
  }
}
```

### 3. Metadata Generator (30 min)

- Create date ranges
- Generate author names
- Add file sizes
- Include version history

## Phase 2: Content Structure (2 hours)

### 1. Department Generator (45 min)

```typescript
export class DepartmentGenerator {
  static readonly DEPARTMENTS = {
    hr: {
      prefix: 'HR',
      fileTypes: ['document', 'spreadsheet'],
      subfolders: ['Policies', 'Recruitment', 'Training']
    },
    finance: {
      prefix: 'FIN',
      fileTypes: ['spreadsheet', 'presentation'],
      subfolders: ['Reports', 'Budgets', 'Invoices']
    }
  } as const;
  
  static generateDepartment(
    name: keyof typeof DepartmentGenerator.DEPARTMENTS
  ): DirectoryNode {
    // Create department structure
    // Add appropriate files
    // Include metadata
  }
}
```

### 2. Project Generator (45 min)

- Create project hierarchies
- Generate milestone folders
- Add related documents
- Include team structures

### 3. Content Distribution (30 min)

- Balance file types
- Distribute across depth
- Create content clusters
- Add related files

## Phase 3: Content Variation (1 hour)

### 1. Randomization System (30 min)

```typescript
export class ContentVariation {
  private static readonly ADJECTIVES = [
    'Quarterly', 'Annual', 'Strategic', 'Confidential'
  ];
  
  private static readonly SUBJECTS = [
    'Report', 'Analysis', 'Review', 'Summary'
  ];
  
  static generateVariations(basePattern: string): string[] {
    // Create variations of names
    // Mix adjectives and subjects
    // Add random elements
  }
}
```

### 2. Content Consistency (30 min)

- Maintain naming patterns
- Ensure logical dates
- Create file relationships
- Add version consistency

## Success Metrics

- Generate 200+ unique file names per game
- Maintain realistic corporate naming conventions
- Create believable department structures
- Ensure consistent metadata across files
- Keep generation time under 1 second
- Support multiple playthroughs with unique content

## Testing Checklist

- [ ] File names are realistic
- [ ] Content distribution is balanced
- [ ] Metadata is consistent
- [ ] Department structures make sense
- [ ] Variations are interesting
- [ ] Performance is good with large structures

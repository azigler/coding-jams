# Dynamic Company Theme Generator Enhancement

## Overview

Create a system that generates unique, quirky company themes for each playthrough, affecting everything from visual style to content naming conventions, ensuring no two games feel the same.

## Enhancement Goals

- Generate memorable and humorous company identities
- Create cohesive visual and textual themes
- Ensure work-appropriate but entertaining content
- Support multiple industry types
- Enable persistent theming across game sessions

## Phase 1: Theme Components (2 hours)

### 1. Company Name Generator (45 min)

```typescript
export class CompanyNameGenerator {
  private static readonly ADJECTIVES = [
    'Quantum', 'Cosmic', 'Digital', 'Organic',
    'Infinite', 'Dynamic', 'Creative', 'Sustainable'
  ];
  
  private static readonly NOUNS = [
    'Penguin', 'Rocket', 'Dragon', 'Unicorn',
    'Panda', 'Phoenix', 'Dolphin', 'Sloth'
  ];
  
  private static readonly INDUSTRIES = [
    'Tech', 'Solutions', 'Innovations', 'Systems',
    'Studios', 'Dynamics', 'Ventures', 'Labs'
  ];
  
  static generate(): string {
    return [
      this.randomFrom(this.ADJECTIVES),
      this.randomFrom(this.NOUNS),
      this.randomFrom(this.INDUSTRIES)
    ].join(' ');
  }
}
```

### 2. Industry Theme System (45 min)

```typescript
export interface IndustryTheme {
  folderPrefixes: string[];
  fileTypes: string[];
  departmentNames: string[];
  jargon: string[];
}

export class IndustryThemes {
  static readonly THEMES: Record<string, IndustryTheme> = {
    tech: {
      folderPrefixes: ['src', 'build', 'docs'],
      fileTypes: ['.js', '.ts', '.md'],
      departmentNames: ['DevOps', 'Frontend', 'Backend'],
      jargon: ['API', 'Cloud', 'Stack']
    },
    creative: {
      folderPrefixes: ['assets', 'projects', 'drafts'],
      fileTypes: ['.psd', '.ai', '.sketch'],
      departmentNames: ['Design', 'Motion', 'Brand'],
      jargon: ['Brand', 'Visual', 'Creative']
    }
  };
}
```

### 3. Theme Assets (30 min)

- Color schemes
- Icon sets
- Font selections
- Sound effects

## Phase 2: Theme Integration (2 hours)

### 1. Theme Manager (45 min)

```typescript
export class ThemeManager {
  private theme: IndustryTheme;
  private companyName: string;
  
  constructor() {
    this.generateNewTheme();
  }
  
  generateNewTheme(): void {
    this.companyName = CompanyNameGenerator.generate();
    this.theme = this.selectTheme();
    this.applyTheme();
  }
  
  private applyTheme(): void {
    // Update UI colors
    // Set folder structure
    // Apply naming conventions
  }
}
```

### 2. Email Generator (45 min)

- Create email templates
- Generate sender personalities
- Add industry-specific content
- Include theme-based signatures

### 3. Visual Customization (30 min)

- Apply color schemes
- Update icons
- Customize fonts
- Add theme effects

## Phase 3: Theme Persistence (1 hour)

### 1. Theme State Management (30 min)

```typescript
export class ThemeState {
  static save(theme: {
    company: string;
    industry: string;
    colors: string[];
    customizations: Record<string, any>;
  }): void {
    localStorage.setItem('currentTheme', JSON.stringify(theme));
  }
  
  static load(): any {
    return JSON.parse(localStorage.getItem('currentTheme') || '{}');
  }
}
```

### 2. Theme Transitions (30 min)

- Smooth color transitions
- Animated icon changes
- Sound effect updates
- Loading states

## Success Metrics

- Generate unique company names 99% of the time
- Maintain consistent theme across all game elements
- Complete theme generation in under 500ms
- Achieve positive player feedback on company themes
- Support at least 5 distinct industry types
- Enable sharing of funny company names

## Testing Checklist

- [ ] Company names are appropriate and humorous
- [ ] Themes are consistent across all elements
- [ ] Visual changes are cohesive
- [ ] Transitions are smooth and professional
- [ ] State persists correctly between sessions
- [ ] Performance remains stable with theme changes

export class FolderGen {
  private static readonly MAX_DEPTH = 10
  private static readonly MAX_ITEMS = 50
  private static readonly TARGET_FILE = "important-client-file.txt"

  private static readonly FOLDER_NAMES = [
    "Documents",
    "Projects",
    "Archive",
    "Backup",
    "Old",
    "New",
    "Important",
    "Misc",
    "Work",
    "Personal",
    "Team",
    "Client",
    "Reports",
    "Data",
    "Resources",
    "Assets",
    "Templates",
    "Drafts",
  ]

  private static readonly FILE_NAMES = [
    "readme.txt",
    "notes.txt",
    "todo.txt",
    "report.pdf",
    "data.xlsx",
    "presentation.pptx",
    "document.docx",
    "config.json",
    "backup.zip",
    "log.txt",
    "summary.pdf",
    "draft.docx",
    "template.xlsx",
  ]

  static generate(): Record<string, any> {
    const structure = this.generateFolder(1)
    this.insertTargetFile(structure, [])
    return structure
  }

  private static generateFolder(depth: number): Record<string, any> {
    const folder: Record<string, any> = {}

    // Stop if we've reached max depth
    if (depth >= this.MAX_DEPTH) {
      return folder
    }

    // Generate random number of items
    const itemCount = Math.floor(Math.random() * 10) + 1

    for (
      let i = 0;
      i < itemCount && Object.keys(folder).length < this.MAX_ITEMS;
      i++
    ) {
      // 70% chance of file, 30% chance of folder
      if (Math.random() < 0.7) {
        const fileName =
          this.FILE_NAMES[Math.floor(Math.random() * this.FILE_NAMES.length)]
        folder[fileName] = false
      } else {
        const folderName =
          this.FOLDER_NAMES[
            Math.floor(Math.random() * this.FOLDER_NAMES.length)
          ]
        if (!folder[folderName]) {
          folder[folderName] = this.generateFolder(depth + 1)
        }
      }
    }

    return folder
  }

  private static insertTargetFile(
    structure: Record<string, any>,
    path: string[]
  ): boolean {
    // Base case: if we're at max depth, add file here
    if (path.length >= this.MAX_DEPTH - 1) {
      structure[this.TARGET_FILE] = false
      return true
    }

    // Get all folders at current level
    const folders = Object.entries(structure)
      .filter(([_, isFolder]) => isFolder)
      .map(([name]) => name)

    if (folders.length === 0) {
      structure[this.TARGET_FILE] = false
      return true
    }

    // Pick a random folder and try to insert there
    const folder = folders[Math.floor(Math.random() * folders.length)]
    return this.insertTargetFile(structure[folder], [...path, folder])
  }
}

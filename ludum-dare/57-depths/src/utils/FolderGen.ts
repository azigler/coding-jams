export class FolderGen {
  private static readonly MAX_DEPTH = 10
  private static readonly MAX_ITEMS = 50
  private static readonly TARGET_FILE = "important-client-file.txt"
  private static readonly MIN_TARGET_DEPTH = 3 // Minimum depth for target file
  private static readonly MAX_TARGET_DEPTH = 6 // Maximum depth for target file

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
    // Generate initial structure
    const structure = this.generateFolder(1)

    // Determine target depth
    const targetDepth = Math.floor(
      Math.random() * (this.MAX_TARGET_DEPTH - this.MIN_TARGET_DEPTH + 1) +
        this.MIN_TARGET_DEPTH
    )

    // Create path to target file
    const targetPath: string[] = []
    let currentFolder = structure

    // Force creation of path to target depth
    for (let i = 0; i < targetDepth; i++) {
      // Get or create a folder at this level
      const availableFolders = this.FOLDER_NAMES.filter(
        (name) => !(name in currentFolder)
      )
      if (availableFolders.length === 0) {
        break // Shouldn't happen with our folder name pool size
      }

      const folderName =
        availableFolders[Math.floor(Math.random() * availableFolders.length)]
      currentFolder[folderName] = this.generateFolder(i + 2)
      targetPath.push(folderName)
      currentFolder = currentFolder[folderName]
    }

    // Insert target file at the chosen depth
    currentFolder[this.TARGET_FILE] = false

    return structure
  }

  private static generateFolder(depth: number): Record<string, any> {
    const folder: Record<string, any> = {}

    // Stop if we've reached max depth
    if (depth >= this.MAX_DEPTH) {
      return folder
    }

    // Generate random number of items (2-6)
    const itemCount = Math.floor(Math.random() * 5) + 2

    for (
      let i = 0;
      i < itemCount && Object.keys(folder).length < this.MAX_ITEMS;
      i++
    ) {
      // 40% chance of file, 60% chance of folder at shallow depths
      // 70% chance of file, 30% chance of folder at deeper depths
      const fileChance = depth > 3 ? 0.7 : 0.4

      if (Math.random() < fileChance) {
        // Add a file
        const fileName =
          this.FILE_NAMES[Math.floor(Math.random() * this.FILE_NAMES.length)]
        if (!folder[fileName]) {
          folder[fileName] = false
        }
      } else {
        // Add a folder
        const folderName =
          this.FOLDER_NAMES[
            Math.floor(Math.random() * this.FOLDER_NAMES.length)
          ]
        if (!folder[folderName]) {
          folder[folderName] = this.generateFolder(depth + 1)
        }
      }
    }

    // Ensure at least one folder at shallow depths
    if (
      depth < 3 &&
      !Object.values(folder).some((v) => typeof v === "object")
    ) {
      const folderName =
        this.FOLDER_NAMES[Math.floor(Math.random() * this.FOLDER_NAMES.length)]
      folder[folderName] = this.generateFolder(depth + 1)
    }

    return folder
  }
}

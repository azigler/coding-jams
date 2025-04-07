export class FolderGen {
  private static readonly MAX_DEPTH = 10
  private static readonly MAX_ITEMS = 50
  private static readonly TARGET_FILE = "important-client-file.txt"
  private static readonly DEFAULT_MIN_TARGET_DEPTH = 3 // Default minimum depth for target file
  private static readonly DEFAULT_MAX_TARGET_DEPTH = 6 // Default maximum depth for target file

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

  static generate(
    minTargetDepth?: number,
    maxTargetDepth?: number
  ): Record<string, any> {
    // Use provided values or defaults
    const effectiveMinDepth = minTargetDepth ?? this.DEFAULT_MIN_TARGET_DEPTH
    const effectiveMaxDepth = maxTargetDepth ?? this.DEFAULT_MAX_TARGET_DEPTH

    // Generate initial structure without target file
    const structure = this.generateFolder(1)

    // Determine target depth
    const targetDepth = Math.floor(
      Math.random() * (effectiveMaxDepth - effectiveMinDepth + 1) +
        effectiveMinDepth
    )

    // Find all valid folders at the target depth
    const validFolders: { folder: Record<string, any>; path: string[] }[] = []
    this.findFoldersAtDepth(structure, targetDepth, [], validFolders)

    // If no valid folders found, create a new path
    if (validFolders.length === 0) {
      let currentFolder = structure
      const path: string[] = []

      for (let i = 0; i < targetDepth; i++) {
        const availableFolders = this.FOLDER_NAMES.filter(
          (name) => !(name in currentFolder)
        )
        if (availableFolders.length === 0) break

        const folderName =
          availableFolders[Math.floor(Math.random() * availableFolders.length)]
        currentFolder[folderName] = this.generateFolder(i + 2)
        path.push(folderName)
        currentFolder = currentFolder[folderName]
      }

      validFolders.push({ folder: currentFolder, path })
    }

    // Choose a random valid folder and add the target file
    const { folder } =
      validFolders[Math.floor(Math.random() * validFolders.length)]
    folder[this.TARGET_FILE] = false

    return structure
  }

  private static findFoldersAtDepth(
    folder: Record<string, any>,
    targetDepth: number,
    currentPath: string[],
    result: { folder: Record<string, any>; path: string[] }[]
  ): void {
    if (currentPath.length === targetDepth) {
      result.push({ folder, path: [...currentPath] })
      return
    }

    for (const [name, content] of Object.entries(folder)) {
      if (typeof content === "object") {
        this.findFoldersAtDepth(
          content,
          targetDepth,
          [...currentPath, name],
          result
        )
      }
    }
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

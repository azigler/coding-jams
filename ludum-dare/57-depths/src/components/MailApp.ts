import "phaser"

export class MailApp extends Phaser.GameObjects.Container {
  public static readonly WIDTH = 400
  public static readonly HEIGHT = 300
  public declare scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0)

    // Create window background
    const bg = scene.add.rectangle(
      0,
      0,
      MailApp.WIDTH,
      MailApp.HEIGHT,
      0x34495e
    )
    bg.setOrigin(0)
    this.add(bg)

    // Create title bar
    const titleBg = scene.add.rectangle(0, 0, MailApp.WIDTH, 30, 0x2c3e50)
    titleBg.setOrigin(0)
    const title = scene.add.text(10, 5, "Mail", {
      font: "16px monospace",
      color: "#ffffff",
    })
    this.add([titleBg, title])

    // Create email content
    const email = scene.add.text(
      10,
      40,
      [
        "Subject: URGENT!!! Need file ASAP!!!",
        "From: Boss McBossface",
        "To: You",
        "",
        "Hey there!",
        "",
        "The client needs 'important-client-file.txt' RIGHT NOW!",
        "You know, that super important file?",
        "It's somewhere in the server...",
        "",
        "Find it ASAP or we're in trouble!",
        "",
        "Thanks!",
        "Boss",
        "",
        "P.S. Don't ask why it's buried in random folders.",
        'IT said something about "security through obscurity"...',
      ].join("\n"),
      {
        font: "14px monospace",
        color: "#ffffff",
        wordWrap: { width: MailApp.WIDTH - 20 },
      }
    )
    this.add(email)
  }
}

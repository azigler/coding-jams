export class MailApp extends Phaser.GameObjects.Container {
  private static readonly WIDTH = 400
  private static readonly HEIGHT = 300

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
        "The client needs that important file RIGHT NOW!",
        "You know, the one about the thing?",
        "It's somewhere in the server...",
        "",
        "Find it ASAP or we're in trouble!",
        "",
        "Thanks!",
        "Boss",
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

package de.htwg.se.durak.controller.controllerComponent

object GameStatus extends Enumeration {
  type GameStatus = Value
  val IDLE, NEW, NEWPLAYER, PLAYERALREADYPRESENT, RESETPLAYERS, MOREPLAYERSNEEDED, ILLEGALTURN, MISSINGBLOCKINGCARD,
  VICTIMHASNOTENOUGHTCARDS, CARDLAYED, LAYCARDFIRST, TAKE, NOCARDSTOTAKE, OK, UNDO, REDO, LOADED, COULDNOTLOAD, SAVED,
  OVER, EXIT = Value

  val map: Map[GameStatus, String] = Map[GameStatus, String](
    IDLE -> "",
    NEW -> "A new game was created.",
    NEWPLAYER -> "A new player was added",
    PLAYERALREADYPRESENT -> "The player you want to add already exists.",
    RESETPLAYERS -> "Reset the players list.",
    MOREPLAYERSNEEDED -> "More players required to start the game.",
    ILLEGALTURN -> "Illegal turn.",
    MISSINGBLOCKINGCARD -> "Missing blocking card.",
    VICTIMHASNOTENOUGHTCARDS -> "Victim has not enough cards to block the attack.",
    CARDLAYED -> "A card was layed.",
    LAYCARDFIRST -> "You have to lay a card first.",
    TAKE -> "Player take cards",
    NOCARDSTOTAKE -> "There are no cards to take.",
    OK -> "Player is ok.",
    UNDO -> "Undone one step.",
    REDO -> "Redone one step.",
    LOADED -> "A new game was loaded.",
    COULDNOTLOAD -> "The requested file could not be loaded.",
    SAVED -> "The game was saved.",
    OVER -> "The game is over.",
    EXIT -> "Exit the game."
  )

  def message(gameStatus: GameStatus): String = {
    map(gameStatus)
  }
}

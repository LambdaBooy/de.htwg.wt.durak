package de.htwg.se.durak.util.undoManager

trait Command {
  def doStep(): Unit
  def undoStep(): Unit
  def redoStep(): Unit
}

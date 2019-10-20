package de.htwg.se.durak

import com.google.inject.AbstractModule
import de.htwg.se.durak.controller.controllerComponent.ControllerInterface
import de.htwg.se.durak.controller.controllerComponent.controllerBaseImpl
import de.htwg.se.durak.model.fileIOComponent.FileIOInterface
import de.htwg.se.durak.model.fileIOComponent.fileIOJsonImpl.FileIO
import de.htwg.se.durak.model.gameComponent.GameInterface
import de.htwg.se.durak.model.gameComponent.gameBaseImpl.Game
import net.codingwell.scalaguice.ScalaModule

class DurakModule extends AbstractModule with ScalaModule {
  def configure(): Unit = {
    bind[GameInterface].to[Game]
    bind[ControllerInterface].to[controllerBaseImpl.Controller]
    bind[FileIOInterface].to[FileIO]
  }
}

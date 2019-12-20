package de.htwg.se.durak

import com.google.inject.{ Guice, Injector }
import de.htwg.se.durak.controller.controllerComponent.ControllerInterface
import de.htwg.se.durak.aview.Tui

import scala.io.StdIn._

object Durak {
  val injector: Injector = Guice.createInjector(new DurakModule)
  val controller: ControllerInterface = injector.getInstance(classOf[ControllerInterface])
  val tui: Tui = new Tui(controller)

  def main(args: Array[String]): Unit = {

    val task = new Runnable {
      def run() {
        try {
          var input: String = ""
          do {
            input = readLine
            tui.processInputLine(input)
          } while (input != "q")
        } catch {
          case _: InterruptedException =>
        }
      }
    }
    new Thread(task).start()
  }
}

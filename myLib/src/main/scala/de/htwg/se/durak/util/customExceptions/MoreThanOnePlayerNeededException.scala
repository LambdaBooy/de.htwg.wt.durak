package de.htwg.se.durak.util.customExceptions

class MoreThanOnePlayerNeededException(val message: String = "More than one player needed!") extends Exception(message)

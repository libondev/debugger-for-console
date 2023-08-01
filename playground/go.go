package main

import "fmt"

var num int = 10
arr := []string{"a", "b", "c"}

type Person struct {
  Name string
  Age int
}

func printHello() {
  fmt.Println("hello world")
}

func main() {
  var person Person
  printHello()
}

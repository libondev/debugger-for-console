int num = 10;
string[] arr = new string[]{"a", "b", "c"};

Person person = new Person();

void PrintHello(){
  Console.WriteLine("hello world");
}

PrintHello();

class Person {
  public string Name {get; set;}
  public int Age {get; set;}
}

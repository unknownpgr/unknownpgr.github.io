---
title: Notes on C Declarations, Definitions, and Macros
tags:
  - programming language
date: 2021-05-19T17:11:29.249Z
---

> This post was translated from Korean into English by AI.

Here are some notes on a few confusing concepts in C.

# Declarations and Definitions

When creating variables or functions in C, there are two related concepts. One is a **declaration**, and the other is a **definition**.

## Declarations

In C, a declaration tells you that

1. an object—a variable or function—corresponding to a particular name (identifier) exists (although you do not know where), and
2. what type the object with that name has (e.g. `int`, `char*`, `void function(int)`).

Therefore, if a function or variable has *only* been declared, you cannot know anything about its actual value or how the function works, and an error occurs during compilation. For example, you can declare a function without defining it, as shown below.

```c
int sum(int a, int b);

int main(){
	int c = 2;
	int d = 3;
	int e = sum(c,d);
    return 0;
}
```

Declaring a function without defining it, as on the first line of the code above, is called a `function prototype`. In this case, compiling the code results in a compilation error. This is because the first line states that a function named `sum` with that signature exists somewhere, but no such function actually exists.

Therefore, a function declaration affects only the compilation stage and has no effect on the binary file that is actually produced. In fact, no matter how many functions you declare without defining in C, the size of the resulting binary does not change at all.

## Definitions

In C, a definition means

1. declaring an object corresponding to a particular name—that is, a variable or function—and at the same time
2. assigning a value to it as well.

Therefore, it is impossible to define something in C without declaring it. However, something may have been declared even though the compiler does not yet know that it has been declared. For example, consider the following case.

```c
void f1(){
	f2();
}

void f2(){
	// content of f2
}
```

In this case, because `f1` is defined before `f2`, the function named `f2` has not yet been declared when the compiler compiles `f1`, so it emits a warning. Another example is the following.

```c
int main(){
	printf("Hello world!");
	return 0
}
```

In this case, because the header file containing the `printf` function was not included using `#include`, `printf` has not been declared when the `main` function is compiled, so the compiler emits a warning.

However, in both cases above, although the functions have not been declared at that point, they do exist, so the compiler can find and insert them normally during the linking stage. Therefore, no compilation error occurs, and the binary is generated successfully.

## extern

In C, to declare a function without defining it, you could simply omit the function body and end the declaration with a semicolon. However, declaring a variable without defining it in C cannot be accomplished simply by not assigning it a value.

```c
#include <stdio.h>

int a;

int main(){
	printf("%d", a);
    return 0;
}
```

For example, at first glance, the code above may appear to declare `a` without defining it because no value is assigned to `a`, and thus seem likely to produce a compilation error. In fact, however, it is equivalent to the following code.

``` c
#include <stdio.h>

int a = 0;

int main(){
	printf("%d", a);
    return 0;
}
```

Because a C compiler automatically initializes all global variables to 0, you cannot create a declaration without a definition simply by omitting an explicit value assignment. To declare something without defining it in C, you must use the `extern` keyword as shown below.

```c
#include <stdio.h>

extern int a;

int main(){
	printf("%d", a);
    return 0;
}
```

In this case, it seems as though an error should occur just as it does with functions, but in practice no error occurs. The code above does compile successfully, which I believe is because the compiler automatically adds a definition when it encounters a variable declared without one. If the contents of a function are not explicitly defined, there is no way for the compiler to handle it automatically. For a variable, however, it is possible to initialize its value to 0, just as when no value is assigned to a global variable. I suspect that is why it works this way. (This is only a guess, and I do not know whether that is actually the reason.)

# #include

One more thing I would like to note is the role of the `#include` preprocessing directive. In highly abstracted languages such as `java` and `python`, the `import` statement performs a variety of complex tasks. In C, however, the `#include` directive does nothing more than bring in the entire contents of another file. For example, you can use an `#include` directive as follows.

```
// test.txt
"This is some string!"
```

```c
#include <stdio.h>

char* string =
#include "test.txt"
;

int main(){
    pritnf("test.txt = %s\n",string);
    return
}
```

This is in fact perfectly valid code that works correctly. This fact explains why, when defining global variables or functions, it is enough to declare them in a header file. Those declarations are copied verbatim into every source file that includes the header file, so the compiler knows at compile time that the declarations exist; and because the actual source file exists, linking also proceeds successfully.

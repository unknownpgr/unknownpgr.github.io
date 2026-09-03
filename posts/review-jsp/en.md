---
title: The Real Problems Developers Face [2]
tags:
  - development
date: 2021-09-16T01:20:31.668Z
---

> This post was translated from Korean into English by AI.

Originally, “The Real Problems Developers Face” was not meant to be a series. But to help a certain senior colleague who went through something similar to me finally get it off his chest (?), I am posting his story on my blog.

> I would like to make it clear that I did not write the post below; I have reproduced my senior colleague’s writing exactly as it was.



# Review of a Certain Company

<Late April–August, spring 2021>

![Download](imgs/download.jpeg)

*“**Internships are a truly wonderful experience**.” -**Abraham Lincoln**-*

 

 Last fall, I worked part-time at a company in Anyang. (It was a part-time job, but it came with health insurance and a pension, so it was no different from an internship.) Then I was accepted for an internship at ETRI, the Electronics and Telecommunications Research Institute in Daejeon, so I quit. After returning from Daejeon, I got a call from the company in Anyang around April and ended up spending the rest of my leave of absence there. Just as I had the previous fall, I started work the very next day. A lot happened over those four and a half months, but I will start with the things that left the strongest impression. To be honest, this is more of a story than anything particularly informative. (Here is the story of how I almost cracked my senior coworker’s skull but held back.)    

## 1. The Beginning

 The company made software for equipment. Each piece of equipment contained about three to five boards. The communication method between boards varied from project to project, but every project I worked on that summer used USB communication. The mainboard was an embedded PC running Windows 10. (My computer ran Windows 7.) We built the GUI with C# WinForms. The program had been written by someone who, I was told, had left the company quite some time ago. Thank goodness. If he had still been there, I might not have been able to stop myself from smacking him in the back of the head. The project code was an absolute mess. The reason was simple: they had repeatedly recycled a single project for other projects, and the developer had done no code management whatsoever. Every code file was in one directory, including files that were not used at all. (There was no login feature, yet there was a file called `login.cs`.) There were even GUI controls positioned outside the UI window. For example, if the window size was 400x600, one control might have coordinates of (600, 700). Those were leftovers too; when they were no longer needed, they had simply been hidden. Inside a file named `Global.cs` was a static class called `Global`, full of all kinds of flags, arrays holding data, and debugging remnants. It was like eating out of the same bowl for ten years without ever washing it.

## 2. Threads of Shock and Horror

 In the beginning, there were three threads. One read and processed data, and it worked fine. Another was a command-parsing thread. It ran, but since it did not communicate with anything, I could not tell whether it actually worked; at least the program ran. The last was a server thread that opened a TCP/IP server, and astonishingly, it was embedded in the main thread. Every thread contained an infinite loop. After uncovering this shocking fact, I examined the function that ran it.

```c#
doThread(){
     ... // Initialize server operation
    while(true){
        try{
        	...
        }catch{
            doThread();
        }
    }    
}
```

 If an exception occurred while the server was running, it actually called the function recursively to reinitialize the server. What was even more shocking was that the recursive call sat inside a `while` loop. There was no `break` statement in the `while` loop, so I suppose it made little difference where the call was, but I had to wonder whether they had put any thought into it at all. And except for the data-processing thread, all the threads were in `mainWindow.cs` (the main window form), which I remember being nearly 2,000 lines long. I gathered the thread-related functions into a new class and assigned the variables accessed only by those threads to fields in that class. 

## 3. Resting Without Resting

 In C#, the two common ways to introduce a delay are `Thread.Sleep(1000)` and `Task.Delay(1000).Wait()`. They behave differently, but they are similar in that the thread does no work during that time. The issue here is `Task.Delay(1000).Wait()`: `Task.Delay()` returns a Task. You have to call `Wait()` for the delay task to run. Amazingly, `Task.Delay(1)` appeared everywhere throughout the code. Why include something that does not even do anything? I found it especially often around the communication code.

```c#
set_XXX();
Task.Delay(1);
set_YYY();
Task.Delay(1);
...
```

Strange things about this:

* The minimum delay for `Delay()` is said to be around 10–20 ms. It varies depending on the system clock, but even if you request 1 ms, the delay will be at least 10 ms.
* Why put nonfunctional code all over the place? (Let us assume they did not know.)
* If a delay is needed every time, why not put the delay in the communication code itself?

* It was written correctly as `Task.Delay(1).Wait()` in another project, so why did it regress?

The code worked fine (?), so I assumed the machine operated without the delays and deleted them all, only to get scolded by the assistant manager. He said that if a delay was there, I should not delete it at will; I should simply replace it with `Thread.Sleep(1)`. He was not wrong, but does it not feel a little unfair to hear that from the person who scattered nonfunctional calls everywhere? I just folded the delay into the communication code.

## 4. Do Twenty Bunny Hops

This connects to the delays discussed above. Every now and then, the code contained something like this:

```c
set_XXX();
flag = read_XXX();
int cnt=0;
while(true){
	if(flag) break;
	else{
		cnt++;
		set_XXX();
		if(cnt>=20) break;
	}
}
```

 The original was more complicated, but my defense mechanisms erased the traumatic memory, so I cannot reproduce it exactly. Roughly summarized, it meant: set a value called XXX, and if it was not set correctly, send the set command some more. It may look profound at first glance, but on closer inspection, it is ridiculous in more ways than one. The `flag` variable is initialized once with `read_XXX()` and never written to again, yet the code keeps checking it in an `if` statement inside the `while` loop. The code above is equivalent to the following:

```c
set_XXX();
flag = read_XXX();
if(flag)
	for(int i=0; i<20; i++)
		set_XXX();
```

 I told the assistant manager how convoluted this code was and that it was effectively the same as the second snippet. I asked why such bizarre code existed. He said he had written it because the equipment did not seem to receive the setup command reliably, and he thought sending it several times might help. He also said he had tried adding a delay between commands so the equipment would have enough time to receive them, but that did not work, which was why he wrote this. As mentioned above, the delay did not run because he had not used the `Wait()` function. Let us be extremely generous and say the delay happened because he did not know. But coding something as convoluted as the first snippet... I could not do that even if someone told me to. LOL. We are human, so there will always be things we do not know. But I do think there is a problem when someone with a master’s degree reads the documentation less than I do, a high school graduate.

## 5. USB Communication

To be honest, I had planned to write only about USB communication and then go to bed, but once I started trying to write about USB, all the little related things kept coming back to me, so I wrote about those first. The equipment had three USB connections. The embedded PC was connected to three boards. The project code was implemented as follows. (XXXX, YYYY, and ZZZZ have been obscured to protect my identity.)

* `commandXXXX.cs` : Conversion functions between board XXXX and the data handled by the project, plus commented-out communication code
* `commandYYYY.cs`: Conversion functions between board YYYY and the data handled by the project, plus commented-out communication code
* `commandMain.cs`: Data conversion functions and communication code (I later learned that it contained the communication code for two USB connections.)
* `commandZZZZ.cs`: Data conversion functions and communication code

Each file contained a static class with the same name as the file, and the static class was packed with one static method after another. Every command used by each board was implemented as its own function. For example, suppose a board could measure temperature, humidity, wind speed, and so on. There would be one method for each function.

```c#
public static int read_Temp() {...};
public static float read_Humidity() {...};
public static int read_wind() {...};
```

Naturally, the contents of every method that sent a command to a board followed the same formula, as shown below. 

```c#
byte[] cmd = new byte[4];
cmd[0] = 0x40; // R/W
cmd[1] = 0x44; // Command code
usb.write(cmd, ...);
usb.read(...);
```

Personally, even copying and pasting that much would have made my arm hurt, so I would have used an enum... Maybe wrapping command codes in functions like this was considered convenient back in the day. (There were problems related to the commands as well.)

The USB objects were also declared as static classes, so there were three USB classes:

* `usbAAA.cs`
* `usbBBB.cs`
* `usbCCC.cs`

Fundamentally, all three USBs connected to a USB device, and because their data-reading and data-writing functions combined the same library functions, their code was identical down to the last character. The only difference was the USB port number. Since `usbCCC` exchanged different data from the other USBs, a new method had been added to it, but its basic structure was the same. Splitting the command classes and USB classes this way took up seven files. As mentioned above, every file was in the same directory.

I am a little proud of the USB portion because it underwent the most dramatic rehabilitation in this project. First, I decided to organize the USB commands into enums. Then I cleaned up the USB section itself by creating an abstract class called `USB`. I implemented the basic functionality for connecting to a USB device and declared the cmd function needed for communication as abstract. Each board had different functionality, so given the relationship USB = board = specific functionality, it made sense to abstract the USB object itself as possessing that specific functionality. I therefore created classes called `usbAAA`, `usbBBB`, and `usbCCC` that inherited from the abstract `USB` class, then implemented the enums and cmd functions inside those classes. (The cmd function had the same structure as the old `set_XXX` and `read_XXX` functions, but took the command code as an argument.) Removing the duplicated code greatly reduced the size of the USB code. There was no need for it to exist separately in three files, so I combined it into one. Since the cmd function replaced the `set_XXX` and `read_XXX` functions, the `commandXXXX.cs` file was no longer necessary either. I moved all the data-conversion functions from `commandXXXX.cs` into a file called `Convert.cs`. Seven files became one. It was now easy to see which routines frequently accessed which USB connections and which commands were unused. That had been absolutely, absolutely, absolutely impossible before.

They say that long ago, programmers were paid in proportion to their number of lines of code. Does that mean my salary should be negative? Heh heh.

## 6. Next-Episode Preview

* git
* Stupid low-pass filters
* Repetitive loops
* Saving settings, Baekjoon-style?
* Harry Potter and the Secret Controls
* The assistant manager is sleepy again today!
* My boss doesn't know what I do (:
* Radioactive GUI
* How to stay up all night winding fiber
* There’s no way my assistant manager doesn’t know about lists
* And more

> Whether these “next episodes” will ever be contributed to my blog... nobody knows.

---
title: An Explanation of Idempotence
tags:
  - development
date: 2021-07-19T05:36:15.583Z
---

> This post was translated from Korean into English by AI.

While studying APIs for a recent project, I felt the need to clearly organize my thoughts on idempotence.

# What Is Idempotence?

Simply put, in computer science, an operation is said to be idempotent if performing the same operation twice produces the same result.

![on-off](imgs/onoff.jpg)

The image above shows a device for turning a train's destination sign (though I am not entirely sure what it is) on or off. Because the power controls are split into separate on and off buttons, pressing either button several times has the same effect as pressing it once. The operation of pressing one of these power buttons can therefore be described as idempotent. In contrast, consider a device such as a TV or computer, which has only one power button. Pressing it the first time turns the device on, while pressing it a second time turns the device off. Pressing the power button on this kind of electronic device is therefore not idempotent.

## Why Should We Design for Idempotence?

Why should APIs and other operations be designed to be idempotent? There are of course many advantages, but I see two in particular: it naturally leads to designs that take functional programming into account, and it eliminates the need for two-way communication, making operations more reliable and faster.

First, let us examine idempotence from the perspective of functional programming. For an operation to be idempotent, its result must depend solely on its input. If an operation does not depend solely on its input, performing the same operation twice may produce different results, which means that it is not idempotent. For example, consider an operation that sets the value of a variable $x$. If it sets that value to, say, a random value, the current time, or $x+1$, then performing the operation multiple times will give $x$ a different value each time. Designing an operation to be idempotent therefore naturally forces its result to depend only on its input, which in turn leads naturally to functional logic.

Next, let us examine idempotence from the perspective of two-way communication, particularly on the web and in databases. In terms of reliability, an idempotent operation always produces the same result even when applied multiple times. This makes it highly reliable because the result does not change even if a request is accidentally submitted twice or is duplicated due to an error.

> You might wonder how often such a situation could arise, but when using a pipeline architecture such as Kafka, delivery-once may not always be guaranteed. At a somewhat lower level, even in TCP communication, the same packet can be delivered twice if the packet itself arrives but its ACK packet is lost. Of course, the kernel ignores duplicate packets, so there is no need to worry about this in ordinary cases.

As for speed, operations are often non-idempotent because they require a database lookup. Retrieving a value from the server takes a very long time for the client, and the database is often a bottleneck within the server as well, so frequent database lookups are undesirable. Designing an operation to be idempotent can improve its execution speed by allowing it to work in one direction: it can be implemented using only database writes, without any operations that read from the database.

## A Practical Example of Idempotence

For example, imagine the operation of clicking “Like” on a website post. Clicking “Like” twice cancels it. Suppose this operation is implemented as follows.

1. Every user's “Like” state is False by default.
2. When a user visits the site, the browser is told whether the user has already clicked “Like.”
3. The user clicks the button in the browser.
4. A `clickLike` request is sent to the server.
5. When the server receives the `clickLike` request, it toggles the “Like” state in the database.
6. The browser toggles the button's state.

At first glance, there does not seem to be much wrong with this logic. However, consider the following scenario.

1. A user is reading a post on a desktop computer.
2. The user then needs to leave the house and continues reading the post on a smartphone. (This is hardly an unusual case, since most services, including YouTube and Facebook, support both mobile and desktop devices.)
3. After finishing the post, the user likes it and clicks “Like.” (The server changes the “Like” state to True.)
4. Later, the user returns to the desktop computer and notices that “Like” does not appear to be selected. (Assume the user has not refreshed the page yet.)
5. The user clicks “Like” once more. (The server changes the “Like” state to False.)
6. In the browser, however, the button appears to indicate that the post has been liked.

> The “Like” feature in this example is not particularly important, but the same example can easily be extended to important features such as a user's personal information or preferences.

To solve this problem while keeping the existing logic, we would need either to implement real-time synchronization using WebSocket or a similar technology, or to have the server return the new state to the browser after receiving the request.

However, implementing real-time synchronization for every user would place an enormous load on the server, while returning the toggled state to the browser would force the user to wait until the server's response arrived.

Instead, suppose the API were designed to be idempotent. Rather than sending a `clickLike` request to the server, the client would send a `like/true` request to set the Like state to True or a `like/false` request to set it to False. Then, even if the scenario above occurred, the user could simply send the request to the server without receiving any response and still know that the feature had behaved as intended.

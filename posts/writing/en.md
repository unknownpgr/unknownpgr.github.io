---
title: Principles for Documentation and Writing
tags:
  - dev
date: 2024-04-16T08:47:24.549Z
---

> This post was translated from Korean into English by AI.

Documents and records are fundamentally a means of conveying what we know to other people or to our future selves. Compared with simply remembering information or communicating it verbally, written records offer the following advantages.

- Human memory is finite, and information is easily lost or corrupted over time. Recording it on a reliable medium, however, can prevent that loss.
- A record can be duplicated into multiple copies and shared with many people at the same time.
- When information is communicated verbally, it can become distorted as it passes from person to person. Records, on the other hand, can be copied accurately and are therefore less prone to distortion.

Writing, however, has a certain order in which information should be presented. This is generally an order that makes the material naturally easier to understand, or one that society has conventionally agreed to follow. Such an order is necessary because simply describing information as it comes to mind does not necessarily put it into a form that readers can easily absorb.

Of course, this order differs from one kind of writing to another because each has a different purpose and provides a different type of information. This post therefore organizes ways to arrange content by type of writing, in the hope that they will be useful when writing in the future.

## When research has been conducted to test a hypothesis, as in an academic paper

- **Abstract**: A summary of the entire study. What is the background of the research? What hypothesis was proposed, how was it tested, what results were obtained, and what do those results mean?

- **Introduction:**

  - **Background:** What is the subject this study seeks to address?

  - **Motivation:** Why should this hypothesis about the subject be tested? What existing problem prompted this research?

  - **Related Works / Literature Review / History:** What related research exists, and how has it approached similar problems? Among the premises needed to test this hypothesis, which have already been studied? What approaches have other studies proposed to solve this problem?

  - **Objective:** What hypothesis is being tested? What does this study seek to accomplish?

  - **Differences:** How does this study distinguish itself from other research? How does its method differ from those used in other studies? What aspects overlooked by other studies does it investigate?

- **Method:** How was the experiment designed? How was the data collected and analyzed? Why are the experiment as designed, the data obtained, and the resulting analysis valid?

- **Result:** What data was obtained from the experiment above? (In this section, it is important to present only the exact data or experimental results, without interpreting them.)

- **Discussion:** What conclusions can be drawn from interpreting these results? What do they mean? What is their academic significance? How do they differ from the conclusions of previous studies? What new discoveries were made? How might they help subsequent research?
- **Conclusion / Limitation:**

  - **Summary:** Summarize the preceding content in one line: what experiment was performed on what subject, what results were obtained, and what those results mean.

  - **Limitation:** Describe what remains lacking. Even after conducting this research, these points could not be established. There is room for error due to these causes. The study did not address these points despite their importance. The experiment has these limitations.

  - **Future Works:** Therefore, this follow-up research should be conducted next. It would be helpful if other researchers addressed these areas. Improving them could create greater value.

## User documentation for developed software, such as a program, library, or service

For this kind of writing, it is helpful to place a link at the top that takes readers directly to the usage section, or an emphasized note directing them to a specific section for instructions. Unlike writing intended for a general audience, readers of this kind of document are likely to have encountered it while looking for a solution to a specific need. For these readers, the Introduction or Motivation may be unnecessary.

- **Introduction:** What is this? What does it do?

- **Motivation:** What inconvenience does it solve? Why was it created? How does it differ from existing products?

- **Requirements / Needs:** How were the software's requirements defined? What requirements was the software written to satisfy? What are its specifications?

- **Usage:**

  - **Getting Started / Quick Start:** What should someone do to try the software right now with minimal effort?

  - **Structure / Architecture:** Explain the form and structure of the software that users need to understand. This does not mean its class structure or internal code. For example, is the software a GUI application, a simple CLI, or a static or dynamic library? Is its architecture monolithic? Do multiple services interact with one another? Is it synchronous or asynchronous? Does it affect the system? Where is it installed, and how is it run? How is it removed?

  - **Interfaces:** What does a user need to know to use the software? Through which interfaces does it interact with users? For example, if it is a library, what APIs does it provide, how should they be called, what do they do, and what results do they produce? If it is a CLI, what parameters should be passed when running it, what does it do, and how does it return the result? If it has a GUI, what pages does it contain, and what happens when each page's buttons are clicked?

- **Others:** Additional information such as the license, warranty period, and contributors

## Technical documentation for software

Technical documentation organizes the information needed to improve or maintain software.

- **Introduction:** As above, describe what the software is. However, anyone modifying its code can be assumed to already have background knowledge, so a brief description may be sufficient. Linking to the user documentation is another option.

- **Requirements:** Describe everything from the abstract requirements the software must satisfy to its specifications and API standards.

- **Structure / Architecture:** Describe the software's internal structure, the components into which it is divided, and the dependencies among them.

- **Components:** Describe the structure and behavior of each component. If the components are hierarchical, this material may be separated into its own document.

- **Development Environment / Convention:** Provide the information needed to contribute in practice, such as how to set up the development environment, code conventions, the Git strategy, and how to write PRs.

- **History / Decision:** Document the decisions made during the software's development. Rather than being essential reading, this section is closer to documentation intended for consultation when someone wonders why something was implemented in a particular way. It may fit under the Components documentation, though making it an independent section is also worth considering.

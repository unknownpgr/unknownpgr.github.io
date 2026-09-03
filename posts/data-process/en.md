---
title: The Real Problems Developers Face
tags:
  - development
date: 2021-08-15T15:30:08.769Z
---

> This post was translated from Korean into English by AI.

When you work in development, you often see ideals clash with reality. This is especially true when you are developing something because someone else told you to, rather than because you wanted to do it yourself. I recently found myself working on a task that fits this situation perfectly, so I wanted to document it in a post.

![2020_06_172ae1e72474f6ccd](imgs/2020_06_172ae1e72474f6ccd.jpg)

# What Do I Need to Do?

The task I have to do sounds very simple. There is some tabular data. All I have to do is upload it to a database. The database is not anything unusual, either; it is just a MySQL database.

# So What Is the Problem?

Well...

- Some of the CSV data is entirely encoded in EUC-KR.
- All the filenames are in Korean and contain spaces and special characters (such as asterisks).
- Everything was sent as compressed files with the `.egg` extension.
  - Fortunately, I was able to request the files again and receive the data in `.zip` format.
- In some cases, about half of the data consists of NULL values.
  - Of course, every dataset represents NULL values differently.
  - Sometimes they are simply empty strings; other times, special strings are used.
- Naturally, the IDs are not unique, so I cannot use a UNIQUE constraint.
  - Nor is there any other unique column besides the ID.
  - In one or two datasets, the ID is numeric, but in all the others it is a string.
- A column's values may be numbers in some cases and strings in others.
  - The only way to find out which is which is to inspect them directly.
  - When they are strings, they sometimes contain `'` or `"` characters.
- Each Excel file contains at least four sheets.
- Every sheet has a different structure.
- In most cases, the header at the top assigns a shared title to two or more grouped columns.
  - Of course, multiple rows are also grouped under a shared label on the left.
- Some sheets are merely cover pages intended for printing, with no content other than a title.
- Some sheets are summaries containing selected content from other sheets.
- Some sheets contain Excel formulas.
- Naturally, the data is not normalized.
  - It is not even in 1NF, so a single column may contain multiple values.
  - Some of those values need to be individually searchable.
- Some files have the `.hwp` extension. They contain data in tables inside Hancom Hangul documents.
- Some files are PDFs exported directly from Hangul documents.
- There are even image files containing pictures of tables.
- Exactly the same data exists under different names and in different formats.
- Data referring to the same thing is written in different ways.
  - Sometimes most of it is identical, but only some values differ.
  - There is no pattern.
- One or two columns are randomly missing from some records, causing every subsequent column to shift to the left.
  - There were one or two such rows among every 1,000 records.
  - Fortunately, there really were only one or two, so I could simply fix them by hand. (I suspect someone made a mistake while combining two or three data files into one by copying and pasting.)

There are several other detailed issues, but I cannot disclose the specific data and related information in a public place such as a blog, so I will leave the summary at that.

# So How Did I Solve It?

I have not yet solved the problem of the materials stored as images, PDFs, and Hangul documents. It seems like I could at least copy and paste the tables from the Hangul documents directly into Excel, but the problem is that I use a Mac, which makes opening Hangul documents quite cumbersome. So I have put that part off for now.

As for the remaining problems, the file formats themselves are consistently CSV or XLSX; it is the structure of their contents that is inconsistent. That made them seem solvable one way or another.

After thinking about it for a long time—and I really did spend more than two days thinking about it—I first created the following simple language for defining the structure of the data. This standardizes the data's name, format, description, and so on in a form that is easy for a computer to process.

```
Data Name
---
AttributeName  Type  Description
...
---
```

Using this language, for example, a `student` schema with a name, student number, and department can be expressed as follows.

```
student
---
name       str name
number     int student number
department str department
---
```

Python supports multiline strings, so I simply put this into a Python file as a string. I then wrote a suitable parser that compiled schemas written in this language into Python objects. Compiling the schema above into a Python object produces the following result.

```python
from config import Schema, Column

student = Schema(
  columns = [
    Column("name",'str','name'),
    Column("number",'int','student number'),
    Column("department",'str','department'),
  ]
)
```

Here, the `config` library and the `Schema` and `Column` classes are classes I wrote.

> As you can see, the syntax above is very simple, so I implemented it using only Python's built-in string-processing functions, without a separate compiler-compiler or anything similar.

Afterward, I performed various tasks by working with the `Schema` and `Column` classes.

For example:

- Formatting and printing the data in an easy-to-read form
- Automatically generating `CREATE` and `INSERT IGNORE` SQL statements for the database corresponding to a `Schema`
- Automatically replacing empty values with `NULL`, which can be used in SQL
- Checking for data errors

Those are some examples.

> In particular, some attributes need to be stored in the database but will never need to be searched by their values. For such attributes, I designed the system so that giving the attribute a hyphen (`-`) as its name automatically groups those attributes into a single array and stores it as a JSON string. This makes the database structure much simpler and easier to manage. It also saves me the trouble of assigning names and types to dozens of unnecessary attributes.

As a result, this made the workflow much simpler. Ordinarily, I would have had to write dozens of parsers, each one reading a file and writing its contents to the database. That is really closer to manual labor than development. However, by putting a little effort into building this parser, I was able to create the following convenient workflow.

1. **Define the data structure using the syntax above**
2. Compile it to automatically generate a Python script
3. Run the Python script to automatically initialize the database and create a new table
4. **Read the file row by row (this is also automated), then perform a small amount of exception handling**
5. Automatically generate SQL from the rows after exception handling
6. Run it against the database, and the job is done

> In particular, when generating SQL, I designed it to process multiple rows in a single query for greater efficiency. This reduces the relative cost of communicating with the database and makes it faster. I also performed some additional database tuning and increased the processing speed to 100,000 records per second.

Of the steps above, only steps 1 and 4, shown in bold, need to be performed once for each data format. Everything else is handled by shared automation scripts.

With this approach, I was able to minimize the amount of file-specific code and process the work efficiently using shared code. The project is still in progress, and I do not know whether I am allowed to make its contents public, so I cannot post the code here. However, if I receive permission to release it in the future, I plan to clean up the source code and post it as well.

# Conclusion

- Building a pipeline takes a lot of work, but once it is set up properly, everything afterward can be done without any manual intervention.
- If it is done well, it can improve speed dramatically.
- I learned why people in IT should seek employment at a good company—one with a strong understanding of IT.

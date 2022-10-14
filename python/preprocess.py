import os
from bs4 import BeautifulSoup

# open the raw html file
raw = open("./test.html")
# create the object
soup = BeautifulSoup(raw)
# grab the container with the full play by play stuff in it, then get its children
cont = list(soup.select("#all_pbp")[0].childGenerator())
# the stuff were after is an html comment at index 4 in the container node
p = BeautifulSoup(cont[4])
# grab the table itself
tbody = p.select("tbody")[0]
# get all the rows
rows = tbody.select("tr")
# filter down to rows that do not have any class attributes
filtered_rows = [r for r in rows if not r.get("class")]
# parse the rows down into a list of their visible text

data = map(lambda row: [el.get_text() for el in row.childGenerator()], filtered_rows)

print(list(data))

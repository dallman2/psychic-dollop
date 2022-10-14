import os
from bs4 import BeautifulSoup

def gen_codes() -> list:    
    # open the raw html file
    raw = open(f"./schedule.html")
    # create the object
    soup = BeautifulSoup(raw)
    # get all the links
    links = soup.select("a")
    # filter to box scores
    filtered = [l for l in links if "boxscore" in l.get_text()]
    # filter down to just the code representing that game. the magic numbers in the indexing are the start and end of the code
    refs = [l["href"][11:-4] for l in filtered]
    return refs


# c = "202209110sdg"
for game_code in gen_codes():
    command = f'curl https://www.pro-football-reference.com/boxscores/{game_code}.htm -o ./games/{game_code}.html'
    os.system(command)



# # open the raw html file
# raw = open(f"./{game_code}.html")
# # create the object
# soup = BeautifulSoup(raw)
# # grab the container with the full play by play stuff in it, then get its children
# cont = list(soup.select("#all_pbp")[0].childGenerator())
# # the stuff were after is an html comment at index 4 in the container node
# p = BeautifulSoup(cont[4])
# # grab the table itself
# tbody = p.select("tbody")[0]
# # get all the rows
# rows = tbody.select("tr")
# # filter down to rows that do not have any class attributes
# filtered_rows = [r for r in rows if not r.get("class")]
# # parse the rows down into a list of their visible text

# data = map(lambda row: [el.get_text() for el in row.childGenerator()], filtered_rows)

# print(list(data))

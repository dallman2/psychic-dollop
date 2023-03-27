import datetime
from functools import partial
import os
import csv
import json
import time
from bs4 import BeautifulSoup
import bs4.element as bs4_elements

prev_time = 'prev'
prev_away_score = '0'
prev_home_score = '0'
years = [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021]


def gen_codes(year) -> list:
    # open the raw html file
    raw = open(f"./schedules/{year}.html")
    # create the object
    soup = BeautifulSoup(raw)
    # get all the links
    links = soup.select("a")
    # filter to box scores
    filtered = [l for l in links if "boxscore" in l.get_text()]
    # filter down to just the code representing that game. the magic numbers in the indexing are the start and end of the code
    refs = [l["href"][11:-4] for l in filtered]
    return refs


def pull_games(interval=20, pull_schedules=False) -> None:
    # for each year...
    for year in years:
        if(pull_schedules):
            # form a command
            schedule_command = f'curl https://www.pro-football-reference.com/years/{year}/games.htm -o ./schedules/{year}.html'
            # issue it
            os.system(schedule_command)
        # generate games from that schedule
        for game_code in gen_codes(year):
            game_command = f'curl https://www.pro-football-reference.com/boxscores/{game_code}.htm -o ./games/{game_code}.html'
            print(f'pulling {game_command}')
            os.system(game_command)
            time.sleep(interval)


def extract_data_from_html(raw, home: str) -> list:
    # create the object
    soup = BeautifulSoup(raw, features="html.parser")
    # grab the container with the full play by play stuff in it, then get its children
    cont = list(soup.select("#all_pbp")[0].childGenerator())
    # the stuff were after is an html comment at index 4 in the container node
    p = BeautifulSoup(cont[4], features="html.parser")
    # grab the table itself
    tbody = p.select("tbody")[0]
    # get all the rows
    rows = tbody.select("tr")
    # filter down to rows that do not have any rows that dont have actual data in them
    filtered_rows = list(filter(_check_row, rows))
    # the first row talks about who won the coin toss, we cant really use it
    return list(map(partial(_mapper, home), filtered_rows))


def _mapper(home: str, row: bs4_elements.Tag):
    return _standardizer(home, *[el.get_text() for el in row.children])


def _check_row(r: bs4_elements.Tag):
    # is it a row for headers and site stuff?
    if r.get("class") and 'thead' in r.get('class'):
        return False
    # get all the fields of the play
    text_list = [t.get_text() for t in list(r.children)]
    # sometimes things just are not filled out, throw em out
    if not (text_list[0] and text_list[2] and text_list[2] and text_list[3]):
        return False
    if "Quarter" in text_list and "Time" in text_list and "Down" in text_list and "ToGo" in text_list:
        return False
    text_joined = ' '.join(text_list)
    # what about a row containing a challenged play, timeout, or a coin toss result?
    if ('Timeout' in text_joined) or ('challenged' in text_joined) or ('won the coin toss' in text_joined):
        return False
    # if not we want it
    return True


def _standardizer(home: str, q: str, time: str, down: str, dist: str, los: str, away_score: str, home_score: str, desc: str, exp_b: str, exp_a: str) -> list:
    # it aint pretty, but it allows me to cache the previous timestamp if there isnt one on the next play
    global prev_time
    if time:
        prev_time = time
    else:
        time = prev_time
    minutes, seconds = time.split(':')
    seconds_left = int(datetime.timedelta(minutes=int(
        minutes), seconds=int(seconds)).total_seconds())

    # do the same thing with scores
    global prev_away_score
    global prev_home_score
    if away_score and home_score:
        prev_away_score = away_score
        prev_home_score = home_score
    else:
        away_score = prev_away_score
        home_score = prev_home_score

    return [
        int(5 if "OT" in q else q),  # what quarter is it?
        seconds_left,  # how many seconds left in the quarter?
        int(down or -1),  # what down is it? (-1 for downless play)
        int(dist or -1),  # how many yards to the first? (-1 if downless)
        # whos side of the field is it on? (1 for home team, 0 for away team)
        1 if home in los else 0,
        # what yard marker is it on? (0 for side of field, 50 for yard marker indicates midfield)
        int(los[4:] or 50),
        int(away_score),  # away team score
        int(home_score)  # home team score
    ]


def process(game_code: str):
    print(game_code)
    # open the raw html file
    raw = open(f"./games/{game_code}")
    # convert html to list of actual data, also pass in who is the home team
    data = extract_data_from_html(raw, game_code[-8:-5])
    # encode the winner as the folder name
    winner = ''
    home_score = data[-1][-1]
    away_score = data[-1][-2]
    if home_score > away_score:
        winner = 'home'
    if home_score < away_score:
        winner = 'away'
    if home_score == away_score:
        winner = 'tie'
    # write the data to a csv without the .html at the end
    with open(f'./processed_games/{winner}/{game_code[:-5]}.csv', 'w', encoding='UTF8') as f:
        print(f"writing {game_code} to file")
        writer = csv.writer(f)
        writer.writerows(data)

# TODO


def modify_processed_games() -> None:
    pass


def generate_processed_file_index() -> None:
    home_index = []
    away_index = []
    for dir, subdirs, files in os.walk('./processed_games/away'):
        for game_code in files:
            away_index.append(game_code)

    for dir, subdirs, files in os.walk('./processed_games/home'):
        for game_code in files:
            home_index.append(game_code)

    index = {
        'home': home_index,
        'away': away_index
    }

    with open("./processed_games/game_index.json", "w") as indexFile:
        json.dump(index, indexFile)


def generate_json_data_from_processed_game():
    ds = []
    line_counts = []
    for dir, subdirs, files in os.walk('./processed_games/away'):
        for game_code in files:
            with open(f'./processed_games/away/{game_code}') as game:
                reader = csv.reader(game)
                line_counts.append(sum(1 for row in reader))
    for dir, subdirs, files in os.walk('./processed_games/home'):
        for game_code in files:
            with open(f'./processed_games/home/{game_code}') as game:
                reader = csv.reader(game)
                line_counts.append(sum(1 for row in reader))

    print(line_counts)
    max_plays = max(line_counts)
    print(max_plays)
    EMPTY_PLAY = [-1, -1, -1, -1, -1, -1, -1, -1]
    AWAY_WINNER = [0, 0, 0, 0, 0, 0, 0, 0]
    HOME_WINNER = [1, 1, 1, 1, 1, 1, 1, 1]

    for dir, subdirs, files in os.walk('./processed_games/away'):
        for game_code in files:
            parsed_game = []
            with open(f'./processed_games/away/{game_code}') as game:
                reader = csv.reader(game)
                diff = max_plays - sum(1 for row in reader)
                for i in range(diff):
                    parsed_game.append(EMPTY_PLAY)
            with open(f'./processed_games/away/{game_code}') as game:
                reader = csv.reader(game)
                for line in reader:
                    parsed_line = [int(el) for el in line]
                    # line.append(game_code)
                    # parsed_line.append(1)
                    parsed_game.append(parsed_line)
                parsed_game.append(AWAY_WINNER)
                # ds.append([parsed_game, [1]])
                ds.append(parsed_game)

    for dir, subdirs, files in os.walk('./processed_games/home'):
        for game_code in files:
            parsed_game = []
            with open(f'./processed_games/home/{game_code}') as game:
                reader = csv.reader(game)
                diff = max_plays - sum(1 for row in reader)
                for i in range(diff):
                    parsed_game.append(EMPTY_PLAY)
            with open(f'./processed_games/home/{game_code}') as game:
                reader = csv.reader(game)
                for line in reader:
                    parsed_line = [int(el) for el in line]
                    # line.append(game_code)
                    # parsed_line.append(1)
                    parsed_game.append(parsed_line)
                parsed_game.append(HOME_WINNER)
                # ds.append([parsed_game, [0]])
                ds.append(parsed_game)

    with open('fullDS.json', 'w') as outfile:
        json.dump({"data": ds}, outfile)

# TODO
# uh oh. pfr throttled bot requests... need to build a bot to slowly request
# https://www.sports-reference.com/bot-traffic.html
pull_games(30)


# generate_json_data_from_processed_game()

# for dir, subdirs, files in os.walk('./games'):
#     for game_code in files:
#         process(game_code)


import os
import csv
import json

from bs4 import BeautifulSoup
import bs4.element as bs4_elements


def _parse_vals(row: list, attempt_html_parse: bool = False) -> list:
    """
    This method takes in a row from a csv file and modifies the row in place.
    Modifications include casting ints represented as strings to ints and bools 
    represented as stings to bools.

    Optionally, pass in `True` for the `attempt_html_parse` option to attempt 
    to replace HTML binds like `&#43;` or `&#amp;` with their `ASCII` equivalents.
    Or maybe its unicode. Idk.
    """
    if attempt_html_parse:
        row[0] = BeautifulSoup(row[0]).get_text()  # Title
        row[1] = BeautifulSoup(row[1]).get_text()  # Album
        row[2] = BeautifulSoup(row[2]).get_text()  # Artist
    row[3] = int(row[3])  # Duration (ms)
    row[4] = int(row[4])  # Rating
    row[5] = int(row[5])  # Play Count
    row[6] = bool(row[6])  # Removed
    return row


def read_csv_file(filename: str) -> list:
    csv_reader = csv.reader(open(filename, 'r').readlines())
    return _parse_vals(list(csv_reader)[1], attempt_html_parse=True)


def read_csv_dir(dirname: str = './excel dump') -> None:
    data: list[list[str]] = []
    data.append(['Title', 'Album', 'Artist', 'Duration (ms)',
                'Rating', 'Play Count', 'Removed'])
    for dir, subdirs, files in os.walk(dirname):
        for filename in files:
            data.append(read_csv_file(f'{dirname}/{filename}'))

    out_data = {'dataset': data}

    with open("./dataset_html_parsed.json", "w") as file:
        json.dump(out_data, file)


    mapping_dict: dict[str, dict[str, list]]
    mapping_dict = {
        'title': {},
        'album': {},
        'artist': {},
    }

    for row in data:
        mapping_dict['title'].setdefault(row[0], [])
        mapping_dict['album'].setdefault(row[1], [])
        mapping_dict['artist'].setdefault(row[2], [])

    for row in data:
        mapping_dict['title'][row[0]].append(row)
        mapping_dict['album'][row[1]].append(row)
        mapping_dict['artist'][row[2]].append(row)

    print(mapping_dict['album']['A Charlie Brown Christmas'])

    # title_album_artist = [song[0:3] for song in data]
    # clean = 0
    # dirty = 0
    # amp_hash = 0
    # for song in title_album_artist:
    #     for entry in song:
    #         if entry.replace(' ', '').isalnum():
    #             clean += 1
    #         else:
    #             if ('&' in entry) and ('#' in entry) and (';' in entry):
    #                 amp_hash += 1
    #                 soup = BeautifulSoup(entry)
    #                 print(soup.get_text())
    #             dirty += 1
    # print(clean)
    # print(dirty)
    # print(amp_hash)


read_csv_dir()

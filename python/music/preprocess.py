
import os
import csv
import json


def read_csv_file(filename: str) -> list:
    csv_reader = csv.reader(open(filename, 'r').readlines())
    return list(csv_reader)[1]


def read_csv_dir(dirname: str = './excel dump') -> None:
    data: list[list[str]] = []
    data.append(['Title', 'Album', 'Artist', 'Duration (ms)',
                'Rating', 'Play Count', 'Removed'])
    for dir, subdirs, files in os.walk(dirname):
        for filename in files:
            data.append(read_csv_file(f'{dirname}/{filename}'))

    title_album_artist = [song[0:3] for song in data]

    clean = 0
    dirty = 0
    amp_hash = 0
    for song in title_album_artist:
        for entry in song:
            if entry.replace(' ', '').isalnum():
                clean += 1
            else:
                if ('&' in entry) and ('#' in entry) and (';' in entry):
                    amp_hash += 1
                dirty += 1

    print(clean)
    print(dirty)
    print(amp_hash)


read_csv_dir()

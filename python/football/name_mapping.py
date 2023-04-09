
def get_mapping_for_year(year: int) -> dict:
    """
    this function gives you the mapping from team names to their abbreviation
    """
    d = {
        # AFC East
        "BUF": '',
        "MIA": '',
        "NWE": '',
        "NYJ": '',
        # AFC North
        "CIN": '',
        "BAL": '',
        "PIT": '',
        "CLE": '',
        # AFC South
        "JAX": '',
        "TEN": '',
        "IND": 'Colts',
        "HOU": 'Texans',
        # AFC West
        "KAN": 'Chiefs',
        "SDG": 'Chargers',
        "RAI": 'Raiders',
        "DEN": 'Broncos',
        # NFC East
        "PHI": 'Eagles',
        "DAL": 'Cowboys',
        "NYG": 'Giants',
        "WAS": 'Redskins',
        # NFC North
        "MIN": 'Vikings',
        "DET": 'Lions',
        "GNB": 'Packers',
        "CHI": 'Bears',
        # NFC South
        "TAM": 'Buccaneers',
        "CAR": 'Panthers',
        "NOR": 'Saints',
        "ATL": 'Falcons',
        # NFC West
        "SFO": '49ers',
        "SEA": 'Seahawks',
        "STL": 'Rams',
        "ARI": 'Cardinals',
    }
    match year:
        case 2012:
            return d
        case 2013:
            return d
        case 2014:
            return d
        case 2015:
            return d
        case 2016:
            return d
        case 2017:
            return d
        case 2018:
            return d
        case 2019:
            return d
        case 2020:
            d['WAS'] = "Washington"
            return d
        case 2021:
            d['WAS'] = "Washington"
            return d


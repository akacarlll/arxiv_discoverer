import requests
from bs4 import BeautifulSoup

def fetch_arxiv_categories(url: str = "https://arxiv.org/" ) -> list:
    """
    Scrape arxiv categories from the given URL.

    Args:
        url (str): URL to scrape categories from. Defaults to "https://arxiv.org/".

    Returns:
        list: List of arxiv publication categories.
    """

    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    category_links = soup.find_all("a", href=lambda x: x and x.startswith("/list/")) # type: ignore

    categories = []
    for link in category_links:
        href = link['href']
        code = href.split('/')[2]
        name = link.text.strip()
        categories.append((code, name))

    categories = list(set(categories))


    return list(set([name for code, name in categories if name != "new" and  name != "recent"]))
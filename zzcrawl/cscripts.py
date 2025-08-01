import asyncio
from crawl4ai import *

async def main():
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(
            url="https://mp.weixin.qq.com/s/rcC9WIyWuaspAdHBUXax1w",
        )
        print(result.markdown)

if __name__ == "__main__":
    asyncio.run(main())
    
    
    
    
     
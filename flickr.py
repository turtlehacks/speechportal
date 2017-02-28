api_key = 

flickr=flickrapi.FlickrAPI(api_key,api_secret,cache=True)

def flickr_walk(keyward):
    photos = flickr.walk(sort='relevance',
                         text=keyward,
                         tag_mode='all',
                         tags=keyward,
                         extras='url_c',
                         per_page=1)

    for photo in photos:
        try:
            url=photo.get('url_c')
            print(url)

        except Exception as e:
            print('failed to download image')
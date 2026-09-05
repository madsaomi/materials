
import sys
sys.path.append('.')
from app import app, get_all_docs

def main():
    print('Starting verification...')
    with app.test_client() as client:
        print('Testing index...')
        resp = client.get('/')
        if resp.status_code != 200:
            print(f'Index failed with {resp.status_code}')
            sys.exit(1)
        
        print('Testing API search...')
        resp_api = client.get('/api/search.json')
        if resp_api.status_code != 200:
            print(f'API failed with {resp_api.status_code}')
            sys.exit(1)
            
        print('Testing get_all_docs()...')
        docs = get_all_docs()
        print(f'Got {len(docs)} docs')
        if len(docs) != 642:
            print(f'Expected 642 docs, got {len(docs)}')
            sys.exit(1)
            
        print('All tests passed: Index 200, API 200, 642 Docs loaded.')

if __name__ == '__main__':
    main()


cd backend
npm i
cp .env.example .env
fill .env
npm run dev

cd frontend 
npm i
npm run dev

cd ml-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
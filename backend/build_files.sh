echo " BUILD START"
apt-get install sqlite3
python3.9  -m pip install -r requirements.txt
python3.9 manage.py collectstatic  --noinput --clear
echo " BUILD END"
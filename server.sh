#!/bin/sh
# sleep 2 && chromium http://localhost:3000/ &
python3 -m http.server
# then: open http://localhost:8000

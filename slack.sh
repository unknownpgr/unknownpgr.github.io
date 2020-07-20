# To use this script, you set secrets SLACK_KEY.
# For example : https://hooks.slack.com/services/T~~~~/~~~~
curl -X POST -H 'Content-type: application/json' --data '{"text":"Github blog updated!"}' ${{ secrets.SLACK_KEY }}
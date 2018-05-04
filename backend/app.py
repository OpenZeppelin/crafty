import json
import boto3
from chalice import Chalice, Response
from random import randint

S3 = boto3.client('s3', region_name='us-east-2')
BUCKET = 'zeppelin-solutions-dev'
DIR = 'crafty'

app = Chalice(app_name='crafty-backend')

def error_catching(f):
  def wrapper():
    try:
      return f()
    except Exception as e:
      return error_response(str(e))
  return wrapper

def ok_response(msg):
  return Response(body=msg,
           status_code=200,
           headers={'Content-Type': 'text/plain'})

def error_response(msg):
  return Response(body='Error: %s' % msg,
           status_code=500,
           headers={'Content-Type': 'text/plain'})


# Metadata

@app.route('/%s/metadata' % DIR , methods=['POST'], cors=True)
@error_catching
def upload_metadata():
  key = get_metadata_key(randint(0, 2 ** 32))
  S3.put_object(Bucket=BUCKET, Key=key, Body=json.dumps(app.current_request.json_body), ACL='public-read')
  return ok_response('https://s3.amazonaws.com/%s/%s' % (BUCKET, key))

def get_metadata_key(uuid):
  return '%s/metadata/%s.json' % (DIR, uuid)

# Thumbnail

@app.route('/%s/thumbnail' % DIR , methods=['POST'], content_types=['application/octet-stream'], cors=True)
@error_catching
def upload_thumbnail():
  uuid = randint(0, 2 ** 32)

  tmp_file_name = '/tmp/%s' % uuid
  with open(tmp_file_name, 'wb') as tmp_file:
    tmp_file.write(app.current_request.raw_body)

  key = get_thumbnail_key(uuid)
  S3.upload_file(Filename=tmp_file_name, Bucket=BUCKET, Key=key, ExtraArgs={'ACL': 'public-read'})

  return ok_response('https://s3.amazonaws.com/%s/%s' % (BUCKET, key))

def get_thumbnail_key(uuid):
  return '%s/thumbnail/%s' % (DIR, uuid)

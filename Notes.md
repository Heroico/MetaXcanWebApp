SETUP
-----

This Web Server is Built with **Python 3.4.3** and **Django 1.8**. 

In order to run tasks, it depends on **Celery**, with **RabbitMQ** as message broker.

At the very least.
```
$ pip install stuff
$ cd metaxcan_client
$ npm install
```

I installed nested routers from repo master:

```bash
$ pip install -e git+git://github.com/alanjds/drf-nested-routers@master#egg=drf-nested-routers-master
```

There is a requirements file, but it has some extra stuff that might not be needed.

To run stuff in dev environment:
```bash
$ sudo rabbitmq-server -detached
$ celery -A mwebproject worker -l info
$ python manage.py runserver
```


- **SECRET KEY must be changed in production**
- If Celery and Django are installed in different environments, theier working folder must be shared/mounted in both.
- You must setup transcriptomes and covariances.
```
$ python manage.py shell

> c = Covariance(name="Whole Blood, European Reference",path="/path/to/COV_TGF_EUR")
> c.save()

```

Node And JS Garbage
-------------------

You might get an error while running **npm install** on **metaxcan_client**:

```bash
...
gyp ERR! configure error 
gyp ERR! stack Error: Command failed: python2 -c import platform; print(platform.python_version());
gyp ERR! stack pyenv: python2: command not found
...
```

node might fail at **install** because I am using python 3 in this project, and **gyp** tool relies on **python2** to exist.
workaround is setting local version to 2.7.X to run install, and remove **.python-version**

Setup Django Rest Framework with its contained token code
---------------------------------------------------------
http://stackoverflow.com/questions/14838128/django-rest-framework-token-authentication

Celery and Rabbit Setup
-----------------------

After installing Celery, do as in this [page](http://docs.celeryproject.org/en/latest/getting-started/brokers/rabbitmq.html):

```bash
$ sudo apt-get install rabbitmq-server
$ sudo rabbitmqctl add_user myuser mypassword
$ sudo rabbitmqctl add_vhost myvhost
$ sudo rabbitmqctl set_user_tags myuser mytag
$ sudo rabbitmqctl set_permissions -p myvhost myuser ".*" ".*" ".*"
```

And run with:

```bash
$ sudo rabbitmq-server -detached
$ sudo rabbitmqctl stop
```
You **might** want to setup Celery connection to Django ORM, instead of rabbit.
Yopu will need to change some config in django.
```bash
# only for django ORM as Celery transport layer.
$ python manage.py migrate djcelery
```
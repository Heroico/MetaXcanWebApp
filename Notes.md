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
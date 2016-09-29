<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>counsel api documentation</title>
    <link rel="stylesheet" href="github-markdown.css">
    <style>
      body {
        padding: 1rem;
      }
    </style>
  </head>
  <body class="markdown-body">
    {{ readme | raw }}
    <a id="api-docs"></a>
    <h3>counsel api documentation</h3>
    <p>
      counsel is comprised of many libraries to make it great!
      please use the below links to navigate to package specific api docs.
    </p>

    <ul>
      {% for pkg in packages %}
        <li>
          <section>
            <h3><a href="{{pkg.name}}">{{pkg.name}}</a></h3>
            <p>{{pkg.packageJSON.description}}</p>
          </section>
        </li>
      {% endfor %}
    </ul>
  </body>
</html>

# grunt-caveman

Compile Caveman templates on the server-side using Grunt.

## Installation

```sh
npm install grunt-caveman
```

## Usage

Add the grunt-caveman task to your Grunt config:

```js
grunt.loadNpmTasks('grunt-caveman');
```

## Example Configuration

```js
caveman: {
  compile: {
    src: ['path/to/templates/*.html'],
    dest: 'public/templates.js'
  }
}
```

## Using pre-compiled templates on the client

```js
var myTemplateData = { foo: [1, 2, 3], bar: true };
var html = Caveman.render('myTemplateName', myTemplateData);
document.getElementById('foo').innerHTML = html;
```

## License

MIT. Copyright &copy; 2014 Andrew Childs

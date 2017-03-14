const jetpack = require('fs-jetpack');
const path = require('path');
const APP_ROOT = __dirname + '/../..';
const layoutParser = require(APP_ROOT + '/data-sources/sio/layoutParser');
const addTable = require(__dirname + '/Table');

const useLayouts = true;
const pageRootPath = path.normalize(APP_ROOT + '/download/10k-users-in-kerio-connect--58309038387064065');
const outPath = pageRootPath + '/index.html';
const pageJson = pageRootPath + '/page.json';

console.log(`> Reading ${pageJson}...`);
let page = JSON.parse(jetpack.read(pageJson));

let body = [`<h1>${page.name}</h1>`];

let pageLayout;

function addChildren(node, html, isRoot) {
	if (isRoot) {
		pageLayout = node.layout.columns;
		console.log(pageLayout);
	}

	for (let child of node.children) {
		html.push(addChild(child, html));
	}
	if (lastLayout && isRoot) {
		body.push(`</div></div>`);
	}
}


let lastLayout;

function addChild(node, html) {
	if (node.layout && node.layout.column !== lastLayout) {
		if (lastLayout) {
			html.push(`</div>`);
		}
		else {
			html.push('<div class="layoutWrap">');
		}

		lastLayout = node.layout.column;
		let width = pageLayout[lastLayout].width;
		if (width) {
			width = width + 'px';
		}
		else {
			width = 'auto';
		}
		let styles = [
			'display: inline-block',
			'width: ' + width,
			'vertical-align: top',
			'overflow-x: hidden',
			'border: 1px solid #eeeeee',
			'padding: 10px'
		];
		html.push(`<div class="column column-${node.layout.column}" style="${styles.join(';')}";>`);
	}

	if (node.type === 'TextNote') {
		html.push(`<h2>${node.name}</h2>`);
		html.push(`<div>${node.value}</div>`);
		pushDelmiter(html);
	}

	else if (node.type === 'Images') {
		// console.log(node.children[0].file);
		html.push(`<h2>${node.name}</h2>`);
		addChildren(node, html);
		pushDelmiter(html);
	}
	else if (node.type === 'File' && node.file.properties.imageFormat) {
		let imgInfo = node.file.properties;
		// html.push(JSON.stringify(node));
		html.push(`<div> <img src="${node.file.name}" width="${imgInfo.imageSize.width}" height="${imgInfo.imageSize.height}" /> </div>`);
	}

	else if (node.type === 'Table') {
		addTable(node, html);
		pushDelmiter(html);
	}

	else if (node.type === 'FileLib') {
		html.push(`<h2>Files</h2>`);
		addChildren(node, html);
		pushDelmiter(html);
	}
	else if (node.type === 'File') {
		html.push(`<a href="${node.file.name}">${node.name}</a>`);
	}
	else {
		throw new Error(`Unknown node type ${node.type} -- ${JSON.stringify(node)}`);
	}
}

function pushDelmiter(html) {
	html.push('<hr />');
}



addChildren(page, body, true);

body = body.join('');


let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
	<title>${page.name}</title>
	<style>
		body, p {
			margin: 0;
		}
		img {
			max-width: 100%;
    		height: auto !important;
		}
		hr {
			border: 1px solid #eeeeee;
		}
		.layoutWrap {
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;
		}

	</style>
<head>

<body style="font-family: Helvetica, Arial, Sans-Serif;">
${body}
</body>
</html>
`;




jetpack.write(outPath, html);

console.log('Done');
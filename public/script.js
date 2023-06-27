// variavei globais
 // Caminho do arquivo JSON
var fileEstoque = 'public/db/estoque.json';
var fileSetor = 'public/db/setor.json';
var fileFuncionario = 'public/db/funcionarios.json';
 // Declarando a variável fora da função de retorno
var estoqueItem;
var dbSetor;
var dbFuncionario;


// carregar arquivo.js
var xmlSetor = new XMLHttpRequest();
xmlSetor.open('GET', fileSetor, true);
xmlSetor.responseType = 'json';
xmlSetor.onload = function() {
  if (xmlSetor.status === 200) {
    dbSetor = xmlSetor.response;
    var selectSetor = document.getElementById("selectSetor");
    // Limpa o conteúdo existente no elemento <select>
    selectSetor.innerHTML = "";
    // Percorrendo o array de itens de estoque (estoqueItem)
    for (var i = 0; i < dbSetor.length; i++) {
        var descricaoSetor = dbSetor[i].DESCRICAO;

        // Cria um novo elemento <option> com a descrição do item
        var option = document.createElement("option");
        option.text = descricaoSetor;

        // Adiciona o novo elemento <option> ao elemento <select>
        selectSetor.add(option);
        }
    }
};
xmlSetor.send();

var xmlFuncionario = new XMLHttpRequest();
xmlFuncionario.open('GET', fileFuncionario, true);
xmlFuncionario.responseType = 'json';
xmlFuncionario.onload = function() {
  if (xmlFuncionario.status === 200) {
    dbFuncionario = xmlFuncionario.response;
    var selectFuncionario = document.getElementById("selectFuncionario");
    // Limpa o conteúdo existente no elemento <select>
    selectFuncionario.innerHTML = "";
    // Percorrendo o array de itens de estoque (estoqueItem)
    for (var i = 0; i < dbFuncionario.length; i++) {
        var descricaoFuncionarios = dbFuncionario[i].DESCRICAO;

        // Cria um novo elemento <option> com a descrição do item
        var option = document.createElement("option");
        option.text = descricaoFuncionarios;

        // Adiciona o novo elemento <option> ao elemento <select>
        selectFuncionario.add(option);
    }
  }
};
xmlFuncionario.send();


var xhr = new XMLHttpRequest();
xhr.open('GET', fileEstoque, true);
xhr.responseType = 'json';
xhr.onload = function() {
  if (xhr.status === 200) {
    estoqueItem = xhr.response; // Acessando a propriedade "cadastroIt" do objeto JSON
    var selectDescricao = document.getElementById("selectDescricao");
    // Limpa o conteúdo existente no elemento <select>
    selectDescricao.innerHTML = "";
    // Percorrendo o array de itens de estoque (estoqueItem)
    for (var i = 0; i < estoqueItem.length; i++) {
        var descricaoItem = estoqueItem[i].DESCRICAO;

        // Cria um novo elemento <option> com a descrição do item
        var option = document.createElement("option");
        option.text = descricaoItem;

        // Adiciona o novo elemento <option> ao elemento <select>
        selectDescricao.add(option);
}

  }
};
xhr.send();

// Eventos de escuta para a entradas de pesquisa
inputPesquisaMascara.addEventListener("input", function() {
    var textoPesquisa = inputPesquisaMascara.value.toLowerCase();
    // Limpa o conteúdo existente no elemento <select>
    selectDescricao.innerHTML = ""; 
    // Percorrendo o array de itens de estoque
    for (var i = 0; i < estoqueItem.length; i++) {
      var descricaoItem = estoqueItem[i].MASCARA.toLowerCase();
      // Verifica se a descrição do item contém o texto de pesquisa
      if (descricaoItem.includes(textoPesquisa)) {
        // Cria um novo elemento <option> com a descrição do item
        var option = document.createElement("option");
        option.text = estoqueItem[i].DESCRICAO;
        // Adiciona o novo elemento <option> ao elemento <select>
        selectDescricao.add(option);
      }
    }
  });

inputPesquisaDescricao.addEventListener("input", function() {
  var textoPesquisa = inputPesquisaDescricao.value.toLowerCase();
  // Limpa o conteúdo existente no elemento <select>
  selectDescricao.innerHTML = "";
  // Percorrendo o array de itens de estoque (estoqueItem)
  for (var i = 0; i < estoqueItem.length; i++) {
    var descricaoItem = estoqueItem[i].DESCRICAO.toLowerCase();
    // Verifica se a descrição do item contém o texto de pesquisa
    if (descricaoItem.includes(textoPesquisa)) {
      // Cria um novo elemento <option> com a descrição do item
      var option = document.createElement("option");
      option.text = estoqueItem[i].DESCRICAO;
      // Adiciona o novo elemento <option> ao elemento <select>
      selectDescricao.add(option);
    }
  }
});

selectDescricao.addEventListener("change", function() {
    for (var i = 0; i < estoqueItem.length; i++) {
        if(estoqueItem[i].DESCRICAO == document.getElementById('selectDescricao').value){
            document.getElementById("inputUnidade").value = estoqueItem[i].UNIDADE;
            document.getElementById("inputValor").value = estoqueItem[i].VALOR;
            document.getElementById("codigoItem").value = estoqueItem[i].CODIGO;
            document.getElementById("inputSaldo").value = estoqueItem[i].SALDO;
        }
    }
});

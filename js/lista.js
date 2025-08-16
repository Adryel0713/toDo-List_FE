let url = "https://todo-list-vroj.onrender.com/do";

let lista = document.querySelector(".lista");

const painel = document.querySelector(".painel");

let message = document.querySelector(".message");

let inputName = document.getElementById("name");
let inputDesc = document.getElementById("desc");
let selectTarefa = document.getElementById("tarefa");

let btnSalvar = document.getElementById("salvar");
let btnExcluir = document.getElementById("excluir");

let fechar = document.getElementById("fechar");

let idAtual = null;

fechar.addEventListener("click", () => {
    document.querySelector(".painel").classList.remove("aberto");
})

const abrirPainelAdicionar = () => {
    painel.classList.add("aberto");
    inputName.value = "";
    inputDesc.value = "";
    selectTarefa.value = "pendente";
    btnExcluir.style.display = "none";
    idAtual = null;
}

document.querySelector(".adicionar").addEventListener("click",abrirPainelAdicionar);



const get = () => {
    lista.innerHTML = ""; 
    fetch(url, {
        method: "GET"
    })
    .then(resp => resp.json())
    .then(dados => {
        console.log(dados);

        dados.sort((a,b) => a.done - b.done)

        dados.forEach(item => {
            lista.innerHTML += `
            <div class="aviso ${item.done === false ? "errado" : "certo"}" data-id="${item.id}">
                <div>
                    <ion-icon name="${item.done ? "checkmark-circle-outline" : "close-circle-outline"}"></ion-icon>
                </div>
                <div class="message">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                </div>
            </div>
            `
        });



        document.querySelectorAll(".aviso").forEach(aviso => {
            aviso.addEventListener("click", (e) => {
                if(e.target.tagName === "ION-ICON"){
                    let id = aviso.getAttribute("data-id");
                    let done = aviso.classList.contains("certo") ? false : true;

                    fetch(url + "/" + id, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({...dados.find(d => d.id == id),done: done
                        })
                    })
                    .then(r => {
                            if(r.ok)
                                get();
                        })
                }
                else{
                        let id = aviso.getAttribute("data-id");
                        carregarItem(id);
                    }

            })
        })

    })
}

const carregarItem = (id) => {
    fetch(url + "/" + id, {method: "GET"})
    .then(resp => resp.json())
    .then(item => {
        idAtual = item.id;
        inputName.value = item.name;
        inputDesc.value = item.description;
        selectTarefa.value = item.done ? "feito" : "pendente";

        document.querySelector(".painel").classList.add("aberto");
        btnExcluir.style.display = "inline-block";
    })    
}

btnSalvar.addEventListener("click", (e) => {
    e.preventDefault();

    const tarefa = {
        name: inputName.value,
        description: inputDesc.value,
        done: selectTarefa.value === "feito"
    }

    if(idAtual){
        fetch(url + "/" + idAtual, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({...tarefa, id: idAtual})
        })
        .then(resp => {
            if(resp.ok){
                message.innerHTML = `<h2 class="funcionou">Tudo atualizado!</h2>`;
                setTimeout(() => { message.innerHTML = "" }, 5000);
                get();
                painel.classList.remove("aberto");
            }
        })
        .catch(() => {
            message.innerHTML = `<h2 class="nao_funcionou">Algum erro aconteceu!</h2>`;
            setTimeout(() => { message.innerHTML = "" }, 5000);
            painel.classList.remove("aberto");
        });
    } 
    else {
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tarefa)
        })
        .then(resp => {
            if(resp.ok){
                message.innerHTML = `<h2 class="funcionou">Tarefa adicionada!</h2>`;
                setTimeout(() => { message.innerHTML = "" }, 5000);
                get();
                painel.classList.remove("aberto");
            }
        })
        .catch(() => {
            message.innerHTML = `<h2 class="nao_funcionou">Erro ao adicionar tarefa!</h2>`;
            setTimeout(() => { message.innerHTML = "" }, 5000);
            painel.classList.remove("aberto");
        });
    }
});


btnExcluir.addEventListener("click", (e) => {
    e.preventDefault();

    if (confirm("Deseja realmente excluir?")) {
        fetch(`${url}/${idAtual}`, { method: "DELETE" })
            .then(resp => {
                if (resp.ok) {
                    message.innerHTML = 
                    `
                    <h2 class="funcionou">Tarefa excluída!</h2>
                    `
                    setTimeout(() => {
                        message.innerHTML = ""
                    }, 5000);
                    get();
                    idAtual = null;
                    inputName.value = "";
                    inputDesc.value = "";
                    selectTarefa.value = "";

                    document.querySelector(".painel").classList.remove("aberto");
                }
            })
            .catch(erro => {
                message.innerHTML = 
                `
                <h2 class="nao_funcionou">Algum problema na exclusão desta tarefa..</h2>
                `
                setTimeout(() => {
                    message.innerHTML = ""
                }, 5000);

                document.querySelector(".painel").classList.remove("aberto");
            })
    }
});


document.addEventListener("DOMContentLoaded",get)






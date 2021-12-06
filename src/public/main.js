var socket = io();
socket.on('productos', data => {
    productosWs = JSON.stringify(data);
});

function enviarProducto(){
    let producto = {
        title: document.getElementById("title").value,
        price: document.getElementById("price").value,
        thumbnail: document.getElementById("thumbnail").value
    }
    socket.emit('producto-nuevo', producto);
}

var template = Handlebars.compile(`
    {{# each mensajes }}
        <p class="text-muted m-0">
                <span class="font-weight-bold text-primary">{{ this.email }}</span>
                <span style="color:brown;">{{this.date}}</span>
                <span class="font-italic text-success">{{ this.message }}</span>
        </p>
    {{/each}}
`)

function addAllMessages(data) {
    document.getElementById('mensajes').innerHTML = template({ mensajes: data.mensajes});
}

function addNewMessage(listaMensajes) {
    document.getElementById("mensajes").innerHTML +=  template({ mensajes: listaMensajes });
}

function enviarMensaje() {
    console.log('se envio un mensaje')
    let hora = moment().format('DD/MM/YYYY HH:mm:ss');
    let mensaje = document.getElementById('mensaje').value;
    let email = document.getElementById('email').value;
    let nombre = document.getElementById('nombre').value;
    let apellido = document.getElementById('apellido').value;
    let alias = document.getElementById('alias').value;
    let edad = document.getElementById('edad').value;
    let avatar = document.getElementById('avatar').value;
    if (email.length > 1) {
        socket.emit('nuevo-mensaje', {
            email: email,
            nombre: nombre,
            apellido: apellido,
            edad: edad,
            alias: alias,
            avatar: avatar,
            hora: hora,
            mensaje: mensaje
        })
    } else {
        alert('Debe ingresar un email')
    }
}

socket.on(`mensajes`, function(data) {
    addAllMessages(data)
})

socket.on('recibir nuevoMensaje', function(listaMensajes) {
    addNewMessage(listaMensajes)
})
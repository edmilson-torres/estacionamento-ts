interface Carro {
  nome: string;
  placa: string;
  entrada: Date;
  saida: Date | string;
  valor: number;
}

interface Encerrar {
  nome: string;
  placa: string;
  tempo: number;
}

class EstacionamentoFront {
  constructor(
    private $: (q: string) => HTMLInputElement,
    private estacionamento = new Estacionamento()
  ) {}

  adicionarFront(carro: Carro) {
    const row = document.createElement('tr');
    carro.entrada = new Date(carro.entrada);
    if (!(carro.saida == '')) {
      carro.saida = new Date(carro.saida);
    }

    row.innerHTML = `
                <td>${carro.nome}</td>
                <td>${carro.placa}</td>
                <td data-time="${carro.entrada}">
                    ${carro.entrada.toLocaleString('pt-BR', {
                      hour: 'numeric',
                      minute: 'numeric',
                    })}
                </td>
                <td data-time="${carro.saida}">${carro.saida.toLocaleString(
      'pt-BR',
      {
        hour: 'numeric',
        minute: 'numeric',
      }
    )}</td>
                <td data-time="${carro.valor}">${carro.valor.toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL',
      }
    )}</td>
                <td>
                <button class="calcular"> ✔️ </button>
                <button class="delete"> ❌ </button>
                </td>
            `;

    this.$('#garage').appendChild(row);
  }

  encerrarFront(cells: HTMLCollection) {
    if (cells[2] instanceof HTMLElement) {
      const veiculo = {
        nome: cells[0].textContent || '',
        placa: cells[1].textContent || '',
        tempo:
          new Date().valueOf() -
          new Date(cells[2].dataset.time as string).valueOf(),
      };

      this.estacionamento.encerrar(veiculo);
    }
  }

  valorFront(cells: HTMLCollection) {
    if (cells[2] instanceof HTMLElement) {
      const valorDoMinuto = 0.2;
      const saida = new Date();
      const saidaEmNumeros = new Date().valueOf();
      const duracao =
        saidaEmNumeros - new Date(cells[2].dataset.time as string).valueOf();
      const duracaoEmMinutos = Math.floor(duracao / 60000);
      const valor = duracaoEmMinutos * valorDoMinuto;
      cells[3].innerHTML = saida.toLocaleString('pt-BR', {
        hour: 'numeric',
        minute: 'numeric',
      });
      cells[4].innerHTML = valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
      const placa = cells[1].innerHTML;
      this.estacionamento.atualizar(placa, saida, valor);
    }
  }

  renderFront() {
    this.$('#garage').innerHTML = '';
    this.estacionamento.patio.map((c) => this.adicionarFront(c));
  }
}

class Estacionamento {
  public patio: Carro[];
  constructor() {
    this.patio = localStorage.patio ? JSON.parse(localStorage.patio) : [];
  }

  adicionar(carro: Carro) {
    this.patio.push(carro);
  }

  carroIndex(placa: string) {
    this.patio = JSON.parse(localStorage.patio);
    return this.patio.map((carro) => carro.placa).indexOf(placa);
  }

  atualizar(placa: string, saida: Date, valor: number) {
    const carroIndex = this.carroIndex(placa);
    this.patio[carroIndex].valor = valor;
    this.patio[carroIndex].saida = saida;
    this.salvar();
  }

  encerrar(info: Encerrar) {
    const msg = `
      Veículo ${info.nome} de placa ${info.placa}.
      \n\n Deseja encerrar?
    `;

    if (!confirm(msg)) return;
    this.patio = this.patio.filter((carro) => carro.placa !== info.placa);
    this.salvar();
  }

  salvar() {
    localStorage.patio = JSON.stringify(this.patio);
  }
}

(function () {
  const $ = (q: string) => {
    const elem = document.querySelector<HTMLInputElement>(q);

    if (!elem) throw new Error('Ocorreu um erro ao buscar o elemento.');

    return elem;
  };

  const estacionamentoFront = new EstacionamentoFront($);
  const estacionamento = new Estacionamento();
  estacionamentoFront.renderFront();

  $('#send').addEventListener('click', () => {
    const nome = $('#name').value;
    const placa = $('#licence').value;

    if (!nome || !placa) {
      alert('Os campos são obrigatórios.');
      return;
    }

    const carro: Carro = {
      nome,
      placa,
      entrada: new Date(),
      saida: '',
      valor: 0,
    };

    estacionamento.adicionar(carro);
    estacionamento.salvar();
    estacionamentoFront.adicionarFront(carro);

    $('#name').value = '';
    $('#licence').value = '';
  });

  $('#garage').addEventListener('click', ({ target }: MouseEvent | any) => {
    if (target.className === 'delete') {
      estacionamentoFront.encerrarFront(
        target.parentElement.parentElement.cells
      );
      estacionamentoFront.renderFront();
    }
    if (target.className === 'calcular') {
      estacionamentoFront.valorFront(target.parentElement.parentElement.cells);
    }
  });
})();

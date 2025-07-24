document.addEventListener("DOMContentLoaded", function () {
    // Elementos do DOM
    const colaboradorForm = document.getElementById('colaboradorForm');
    const etapa2 = document.getElementById('etapa2');
    const reportForm = document.getElementById('reportForm');
    const reportTableBody = document.getElementById('reportTableBody');
    const totalsList = document.getElementById('totalsList');
    const exportPdfButton = document.getElementById('exportPdfButton');
    const exportExcelButton = document.getElementById('exportExcelButton');
    const numeroLinhaContainer = document.getElementById('numeroLinhaContainer');
    const tipoLinhaContainer = document.getElementById('tipoLinhaContainer');
    const valorContainer = document.getElementById('valorContainer');
    const modalSelect = document.getElementById('modal');
    const bilhetagemSelect = document.getElementById('bilhetagem');
    const otherField = document.getElementById('otherField');

    // Dados da aplicação
    let reports = [];
    let dailyTotals = {};
    let colaboradorData = {};

    // Event Listeners
    colaboradorForm.addEventListener('submit', handleColaboradorSubmit);
    reportForm.addEventListener('submit', handleReportSubmit);
    modalSelect.addEventListener('change', handleModalChange);
    bilhetagemSelect.addEventListener('change', showOtherField);
    exportPdfButton.addEventListener('click', exportToPDF);
    exportExcelButton.addEventListener('click', exportToExcel);
    document.getElementById('valor').addEventListener('input', function () {
        formatValor(this);
    });

    // Funções de manipulação de eventos
    function handleColaboradorSubmit(event) {
        event.preventDefault();

        if (!document.getElementById('autorizacao').checked) {
            alert('Você precisa marcar a caixa de autorização antes de salvar os dados.');
            return;
        }

        colaboradorData = {
            nomeCompleto: document.getElementById('nomeCompleto').value.toUpperCase(),
            endereco: document.getElementById('endereco').value.toUpperCase(),
            bairro: document.getElementById('bairro').value.toUpperCase(),
            cidade: document.getElementById('cidade').value.toUpperCase(),
            telefone: document.getElementById('telefone').value,
            dataEnvio: document.getElementById('dataEnvio').value,
            tipoRelatorio: document.getElementById('tipoRelatorio').value.toUpperCase(),
            equipe: document.getElementById('equipe').value.toUpperCase(),
            autorizacao: document.getElementById('autorizacao').checked
        };

        colaboradorForm.style.display = 'none';
        etapa2.style.display = 'block';
        handleModalChange();
    }

    function handleReportSubmit(event) {
        event.preventDefault();

        const report = {
            dataVisita: document.getElementById('dataVisita').value.toUpperCase(),
            ida: document.getElementById('ida').value.toUpperCase(),
            destino: document.getElementById('destino').value.toUpperCase(),
            bilhetagem: document.getElementById('bilhetagem').value.toUpperCase(),
            modal: modalSelect.value.toUpperCase(),
            valor: parseFloat(document.getElementById('valor').value) || 0,
            numeroLinha: document.getElementById('numeroLinha').value.toUpperCase(),
            tipoLinha: document.getElementById('tipoLinha').value.toUpperCase()
        };

        if (report.modal === 'A PÉ') {
            report.valor = 0;
            report.tipoLinha = '';
        }

        reports.push(report);
        addReportToTable(report);
        updateTotals();

        reportForm.reset();
        document.getElementById('dataVisita').value = report.dataVisita;
        handleModalChange();
    }

    // Funções auxiliares
    function addReportToTable(report) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${report.dataVisita}</td>
            <td>${report.ida}</td>
            <td>${report.destino}</td>
            <td>${report.bilhetagem}</td>
            <td>${report.modal}</td>
            <td>${report.numeroLinha || '-'}</td>
            <td>${report.tipoLinha || '-'}</td>
            <td>R$ ${report.valor.toFixed(2)}</td>
            <td><button type="button" class="delete-button" onclick="removeReport(this)">REMOVER</button></td>
        `;
        reportTableBody.appendChild(row);
    }

    function updateTotals() {
        dailyTotals = {};
        reports.forEach(report => {
            dailyTotals[report.dataVisita] = (dailyTotals[report.dataVisita] || 0) + report.valor;
        });

        totalsList.innerHTML = '';
        for (const [day, total] of Object.entries(dailyTotals)) {
            const li = document.createElement('li');
            li.textContent = `${day}: R$ ${total.toFixed(2)}`;
            totalsList.appendChild(li);
        }
    }

    function showOtherField() {
        if (bilhetagemSelect.value === "outros") {
            otherField.style.display = "block";
        } else {
            otherField.style.display = "none";
            document.getElementById("other").value = "";
        }
    }

    function handleModalChange() {
        const modal = modalSelect.value.toUpperCase();
        if (modal === 'ÔNIBUS') {
            numeroLinhaContainer.classList.remove('hidden');
            tipoLinhaContainer.classList.remove('hidden');
            valorContainer.classList.remove('hidden');
        } else if (modal === 'A PÉ') {
            numeroLinhaContainer.classList.add('hidden');
            tipoLinhaContainer.classList.add('hidden');
            valorContainer.classList.add('hidden');
            document.getElementById('valor').value = 0;
        } else {
            numeroLinhaContainer.classList.add('hidden');
            tipoLinhaContainer.classList.add('hidden');
            valorContainer.classList.remove('hidden');
        }
    }

    function formatValor(input) {
        let valor = input.value.replace(/[^\d]/g, '');
        valor = valor.substring(0, 4);
        if (valor.length > 2) {
            valor = valor.substring(0, valor.length - 2) + '.' + valor.substring(valor.length - 2);
        }
        input.value = valor;
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Funções de exportação
    function exportToPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Página 1: Dados do colaborador (mantido igual)
        doc.setFontSize(16);
        doc.text("RELATÓRIO DE PASSAGEM", 105, 20, { align: 'center' });

        doc.setFontSize(10);
        let yPosition = 30;

        const colaboradorFields = [
            `NOME: ${colaboradorData.nomeCompleto}`,
            `ENDEREÇO: ${colaboradorData.endereco}`,
            `BAIRRO: ${colaboradorData.bairro}`,
            `CIDADE: ${colaboradorData.cidade}`,
            `TELEFONE: ${colaboradorData.telefone}`,
            `DATA DE ENVIO: ${formatDate(colaboradorData.dataEnvio)}`,
            `TIPO DE RELATÓRIO: ${colaboradorData.tipoRelatorio}`,
            `EQUIPE: ${colaboradorData.equipe}`
        ];

        colaboradorFields.forEach(field => {
            doc.text(field, 14, yPosition);
            yPosition += 10;
        });

        yPosition += 10;

        // Termo de Autorização (mantido igual)
        doc.setFontSize(12);
        doc.text("TERMO DE AUTORIZAÇÃO", 105, yPosition, { align: 'center' });
        yPosition += 10;

        doc.setFontSize(10);
        const autorizacaoText = [
            `Eu, ${colaboradorData.nomeCompleto}, residente no endereço ${colaboradorData.endereco}, `,
            `${colaboradorData.bairro}, ${colaboradorData.cidade}, autorizo a inclusão e a integração dos `,
            "benefícios tarifários como o Bilhete Único Intermunicipal (BUI), Bilhete Único Carioca (BUC) ou ",
            "quaisquer outros benefícios tarifários para fins de utilização no transporte público. Declaro, ainda, ",
            "que esses benefícios serão devidamente registrados no relatório de vale-transporte."
        ];

        doc.text(autorizacaoText, 15, yPosition, { maxWidth: 180, align: 'justify' });

        if (reports.length > 0) {
            // Página 2: RELATÓRIOS DETALHADOS (antiga página 3)
            doc.addPage();
            doc.setFontSize(16);
            doc.text("RELATÓRIOS DETALHADOS", 105, 20, { align: 'center' });

            doc.autoTable({
                startY: 30,
                head: [['DATA DA VISITA', 'IDA', 'DESTINO', 'BILHETAGEM', 'MODAL', 'NÚMERO DA LINHA', 'TIPO DE LINHA', 'VALOR']],
                body: reports.map(report => [
                    report.dataVisita,
                    report.ida,
                    report.destino,
                    report.bilhetagem,
                    report.modal,
                    report.numeroLinha || '-',
                    report.tipoLinha || '-',
                    'R$ ' + report.valor.toFixed(2)
                ]),
                margin: { horizontal: 15 },
                styles: { fontSize: 5, cellPadding: 3 },
                headerStyles: { fillColor: [0, 0, 0], textColor: 255 }
            });

            // Página 3: RESUMO E TOTAIS (antigas páginas 2 e 4 unidas)
            doc.addPage();

            // Cálculos necessários
            const bilhetagemTotals = {};
            reports.forEach(report => {
                bilhetagemTotals[report.bilhetagem] = (bilhetagemTotals[report.bilhetagem] || 0) + report.valor;
            });

            // Seção de Resumo por Bilhetagem
            doc.setFontSize(16);
            doc.text("RESUMO POR BILHETAGEM", 105, 20, { align: 'center' });

            let yPos = 30;
            doc.setFontSize(12);
            doc.text("Bilhetagem", 20, yPos);
            doc.text("Valor Total", 150, yPos);
            yPos += 10;

            doc.setFontSize(10);
            for (const [bilhetagem, total] of Object.entries(bilhetagemTotals)) {
                doc.text(bilhetagem, 20, yPos);
                doc.text(`R$ ${total.toFixed(2)}`, 150, yPos);
                yPos += 10;
            }

            // Seção de Totais por Dia
            yPos += 15;
            doc.setFontSize(16);
            doc.text("TOTAIS POR DIA", 105, yPos, { align: 'center' });
            yPos += 10;

            doc.setFontSize(12);
            for (const [day, total] of Object.entries(dailyTotals)) {
                doc.text(`${day}: R$ ${total.toFixed(2)}`, 20, yPos);
                yPos += 10;
            }

            // Total Geral
            yPos += 5;
            const grandTotal = Object.values(bilhetagemTotals).reduce((sum, total) => sum + total, 0);
            doc.setFontSize(12);
            doc.text("TOTAL GERAL", 20, yPos);
            doc.text(`R$ ${grandTotal.toFixed(2)}`, 150, yPos);
        }

        doc.save(`Relatorio_Passagem_${colaboradorData.nomeCompleto}.pdf`);
    }

    function exportToExcel() {
        const wb = XLSX.utils.book_new();

        // Planilha 1: Dados do Colaborador (mantido igual)
        const colaboradorSheetData = [
            ["RELATÓRIO DE PASSAGEM"],
            [""],
            ["DADOS DO COLABORADOR"],
            ["Nome Completo:", colaboradorData.nomeCompleto],
            ["Endereço:", colaboradorData.endereco],
            ["Bairro:", colaboradorData.bairro],
            ["Cidade:", colaboradorData.cidade],
            ["Telefone:", colaboradorData.telefone],
            ["Data de Envio:", formatDate(colaboradorData.dataEnvio)],
            ["Tipo de Relatório:", colaboradorData.tipoRelatorio],
            ["Equipe:", colaboradorData.equipe],
            [""],
            ["TERMO DE AUTORIZAÇÃO"],
            [""],
            ["Eu, " + colaboradorData.nomeCompleto + ", residente no endereço " + colaboradorData.endereco + ", " +
                colaboradorData.bairro + ", " + colaboradorData.cidade + ", autorizo a inclusão e a integração dos " +
                "benefícios tarifários como o Bilhete Único Intermunicipal (BUI), Bilhete Único Carioca (BUC) ou " +
                "quaisquer outros benefícios tarifários para fins de utilização no transporte público. Declaro, ainda, " +
                "que esses benefícios serão devidamente registrados no relatório de vale-transporte."],
            [""],
            ["Assinatura do Colaborador: _________________________________________"]
        ];

        const wsColaborador = XLSX.utils.aoa_to_sheet(colaboradorSheetData);
        XLSX.utils.book_append_sheet(wb, wsColaborador, 'Dados e Autorização');

        // Planilha 2: Relatórios Detalhados (antiga aba 3)
        const wsReports = XLSX.utils.json_to_sheet(reports.map(report => ({
            'DATA DA VISITA': report.dataVisita,
            'IDA': report.ida,
            'DESTINO': report.destino,
            'BILHETAGEM': report.bilhetagem,
            'MODAL': report.modal,
            'NÚMERO DA LINHA': report.numeroLinha || '-',
            'TIPO DE LINHA': report.tipoLinha || '-',
            'VALOR': 'R$ ' + report.valor.toFixed(2)
        })));
        XLSX.utils.book_append_sheet(wb, wsReports, 'Relatórios');

        // Planilha 3: Resumo e Totais (antigas abas 2 e 4 unidas)
        const bilhetagemTotals = {};
        reports.forEach(report => {
            bilhetagemTotals[report.bilhetagem] = (bilhetagemTotals[report.bilhetagem] || 0) + report.valor;
        });

        const combinedData = [
            ["RESUMO POR BILHETAGEM"],
            [""],
            ["Bilhetagem", "Valor Total"],
            ...Object.entries(bilhetagemTotals).map(([bilhetagem, total]) =>
                [bilhetagem, 'R$ ' + total.toFixed(2)]
            ),
            ["", ""],
            ["TOTAIS POR DIA"],
            [""],
            ["Data", "Total"],
            ...Object.entries(dailyTotals).map(([day, total]) =>
                [day, 'R$ ' + total.toFixed(2)]
            ),
            ["", ""],
            ["TOTAL GERAL", 'R$ ' + Object.values(bilhetagemTotals).reduce((sum, total) => sum + total, 0).toFixed(2)]
        ];

        const wsCombined = XLSX.utils.aoa_to_sheet(combinedData);
        XLSX.utils.book_append_sheet(wb, wsCombined, 'Resumo e Totais');

        XLSX.writeFile(wb, `Relatorio_Passagem_${colaboradorData.nomeCompleto}.xlsx`);
    }

    // Função global para remover relatórios
    window.removeReport = function (button) {
        const row = button.closest('tr');
        const index = Array.from(reportTableBody.children).indexOf(row);
        reports.splice(index, 1);
        row.remove();
        updateTotals();
    };
});

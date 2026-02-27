Vue.component('task-card', {
    template: `
        <div class="card">
            <h4>{{ card.title }}</h4>
            <p>{{ card.description }}</p>
            <small> {{ formatDate(card.deadline) }}</small>
            <div class="card-actions">
                <button @click="$emit('edit', card)" class="btn-edit">✏️</button>
            </div>
        </div>
    `,
    props: ['card', 'columnIndex'],
    methods: {
        formatDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString('ru-RU');
        }
    }
});

new Vue({
    el: '#app',
    data: {
        columns: [
            { title: ' Запланированные', cards: [] },
            { title: ' В работе', cards: [] },
            { title: ' Тестирование', cards: [] },
            { title: ' Выполненные', cards: [] }
        ],
        showModal: false,
        isEdit: false,
        editingCard: null,
        newCard: { title: '', description: '', deadline: '' }
    },
    methods: {
        openModal() {
            this.newCard = { title: '', description: '', deadline: '' };
            this.isEdit = false;
            this.showModal = true;
        },
        openEditModal(card) {
            this.editingCard = { ...card };
            this.newCard = {
                title: card.title,
                description: card.description,
                deadline: card.deadline
            };
            this.isEdit = true;
            this.showModal = true;
        },
        createCard() {
            if (this.newCard.title && this.newCard.description && this.newCard.deadline) {
                if (this.isEdit) {
                    const card = this.findCard(this.editingCard.id);
                    if (card) {
                        card.title = this.newCard.title;
                        card.description = this.newCard.description;
                        card.deadline = this.newCard.deadline;
                        card.updatedAt = new Date().toISOString();
                    }
                } else {
                    const card = {
                        id: Date.now(),
                        title: this.newCard.title,
                        description: this.newCard.description,
                        deadline: this.newCard.deadline,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        returnReason: ''
                    };
                    this.columns[0].cards.push(card);
                }
                this.showModal = false;
                this.saveData();
            }
        },
        findCard(id) {
            for (let col of this.columns) {
                const card = col.cards.find(c => c.id === id);
                if (card) return card;
            }
            return null;
        },
        saveData() {
            localStorage.setItem('kanbanData', JSON.stringify(this.columns));
        },
        loadData() {
            const data = localStorage.getItem('kanbanData');
            if (data) this.columns = JSON.parse(data);
        }
    },
    mounted() {
        this.loadData();
    }
});
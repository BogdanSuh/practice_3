Vue.component('task-card', {
    template: `
        <div class="card">
            <h4>{{ card.title }}</h4>
            <p>{{ card.description }}</p>
            <small>{{ formatDate(card.deadline) }}</small>
        </div>
    `,
    props: ['card'],
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
            { title: 'Запланированные', cards: [] },
            { title: 'В работе', cards: [] },
            { title: 'Тестирование', cards: [] },
            { title: 'Выполненные', cards: [] }
        ]
    }
});
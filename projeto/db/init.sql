CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(80) NOT NULL,
    start_time DATE NOT NULL,
    end_time DATE NOT NULL,
    planning_time DATE NOT NULL
);

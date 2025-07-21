const Car = class {
    constructor() {
        Garage.notify();
    }

    start() {
        Car.report();
    }

    static report() {
        const g = new Garage();
        g.service();
    }
};

class Garage {
    private car: any;

    constructor() {
        this.car = new Car();
        this.car.start();

        Car.report();
    }

    service() {
        this.car.start();

        Car.report();
    }

    static notify() {
        const c = new Car();
        c.start();
    }
}




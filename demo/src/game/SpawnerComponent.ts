class SpawnComponent extends Component implements ITriggerListener {
    public cooldown = -1;
    public minInterval = 2;
    public maxInterval = 60;
    public enemyType = EnemyType.worm;
    public numSpawned = 0;
    public numAlive = 0;

    constructor(enemyType: EnemyType) {
        super();
        this.enemyType = enemyType;
    }

    public initialize() {
        // console.log("initialize");
    }

    public update() {
        // console.log("update");
        this.entity.getComponent<Mover>(Mover).move(new Vector2(0, 0));
    }

    public onTriggerEnter(other: Collider, local: Collider){
        console.log("enter collider");
    }

    public onTriggerExit(other: Collider, local: Collider){
        console.log("exit collider");
    }
}

enum EnemyType {
    worm
}
/** 运行时的场景管理。 */
class SceneManager {
    private static _scene: Scene;
    private static _nextScene: Scene;
    public static sceneTransition: SceneTransition;
    public static stage: egret.Stage;
    /** 订阅此事件以在活动场景发生更改时得到通知。 */
    public static activeSceneChanged: Function;
    /** 核心发射器。只发出核心级别的事件 */
    public static emitter: Emitter<CoreEvents>;
    /** 全局内容管理器加载任何应该停留在场景之间的资产 */
    public static content: ContentManager;
    /** 简化对内部类的全局内容实例的访问 */
    private static _instnace: SceneManager;
    public static get Instance(){
        return this._instnace;
    }

    constructor(stage: egret.Stage) {
        stage.addEventListener(egret.Event.ENTER_FRAME, SceneManager.update, this);

        SceneManager._instnace = this;
        SceneManager.emitter = new Emitter<CoreEvents>();
        SceneManager.content = new ContentManager();

        SceneManager.stage = stage;
        SceneManager.initialize(stage);
    }

    public static get scene() {
        return this._scene;
    }
    public static set scene(value: Scene) {
        if (!value)
            throw new Error("场景不能为空");

        if (this._scene == null) {
            this._scene = value;
            this._scene.begin();
            SceneManager.Instance.onSceneChanged();
        } else {
            this._nextScene = value;
        }

        this.registerActiveSceneChanged(this._scene, this._nextScene);
    }

    public static initialize(stage: egret.Stage) {
        Input.initialize(stage);
    }

    public static update() {
        Time.update(egret.getTimer());

        if (SceneManager._scene) {
            for (let i = GlobalManager.globalManagers.length - 1; i >= 0; i--) {
                if (GlobalManager.globalManagers[i].enabled)
                    GlobalManager.globalManagers[i].update();
            }

            if (!SceneManager.sceneTransition ||
                (SceneManager.sceneTransition && (!SceneManager.sceneTransition.loadsNewScene || SceneManager.sceneTransition.isNewSceneLoaded))) {
                    SceneManager._scene.update();
            }

            if (SceneManager._nextScene) {
                SceneManager._scene.end();

                SceneManager._scene = SceneManager._nextScene;
                SceneManager._nextScene = null;
                SceneManager._instnace.onSceneChanged();

                SceneManager._scene.begin();
            }
        }

        SceneManager.render();
    }

    public static render() {
        if (this.sceneTransition){
            this.sceneTransition.preRender();

            if (this._scene && !this.sceneTransition.hasPreviousSceneRender){
                this._scene.render();
                this._scene.postRender();
                this.sceneTransition.onBeginTransition();
            } else if (this.sceneTransition) {
                if (this._scene && this.sceneTransition.isNewSceneLoaded) {
                    this._scene.render();
                    this._scene.postRender();
                }
    
                this.sceneTransition.render();
            }
        } else if (this._scene) {
            this._scene.render();

            Debug.render();

            this._scene.postRender();
        }
    }

    /**
     * 临时运行SceneTransition，允许一个场景过渡到另一个平滑的自定义效果。
     * @param sceneTransition 
     */
    public static startSceneTransition<T extends SceneTransition>(sceneTransition: T): T {
        if (this.sceneTransition) {
            console.warn("在前一个场景完成之前，不能开始一个新的场景转换。");
            return;
        }

        this.sceneTransition = sceneTransition;
        return sceneTransition;
    }

    public static registerActiveSceneChanged(current: Scene, next: Scene){
        if (this.activeSceneChanged)
            this.activeSceneChanged(current, next);
    }

    /**
     * 在一个场景结束后，下一个场景开始之前调用
     */
    public onSceneChanged(){
        SceneManager.emitter.emit(CoreEvents.SceneChanged);
        Time.sceneChanged();
    }
}
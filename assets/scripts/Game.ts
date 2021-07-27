
import { _decorator, Component, Node, Collider, ITriggerEvent, AudioSource, AudioClip, instantiate, Prefab, Vec2, Vec3, NodePool, Label, setDisplayStats, tween } from 'cc';
import { DEBUG } from 'cc/env';
import { Player } from './Player';
import { Star } from './Star';
const { ccclass, property } = _decorator;


@ccclass('Game')
export class Game extends Component {
    // 主角节点
    @property({type: Node})
    public monster: Node = null!;

    // 星星节点
    @property({type: Prefab})
    public starPrefab: Node = null!;

    // 摘星音效
    @property({type: AudioClip})
    public pickAudio: AudioClip = null!;

    // 分数节点
    @property({type: Node})
    public scoreDisplay: Node = null!;

    // 按钮节点
    @property({type: Node})
    public startBtn: Node = null!;

    // 限制半径
    @property
    public starLimitRadius = 2.4;
    // 限制高度
    @property
    public groundY = 2;
    // 星星存在时间
    @property
    public starDuration = 3;

    // 音频组件
    private _audioSource = new AudioSource();
    // 节点池
    private _starPool = new NodePool();
    // 当前星星
    private _currentStar = new Node();
    // 分数
    private _score = 0;

    start () {
        // 隐藏调试信息
        setDisplayStats(false);

        // 监听碰撞触发
        let collider = this.monster.getComponent(Collider)!;
        collider.on('onTriggerEnter', this.onTriggerEnter, this);
    }

    onTriggerEnter (event: ITriggerEvent) {
        // 发生触碰
        this.despawnStar();
        this.spawnNewStar();
        this.gainSocre();
    }

    spawnNewStar () {
        // 生成新的星星
        let star: Node = new Node();
        if (this._starPool.size() > 0) {
            star = this._starPool.get(this)!;
        }
        else {
            star = instantiate(this.starPrefab)!;
            star.getComponent(Star)?.reuse(this);
        }

        // 添加到场景中、设置随机位置、设置大小
        this.node.addChild(star);
        star.setPosition(this.getNewStarPosition());
        star.setScale(0.4, 0.4, 0.4);
        
        // 方便回收
        this._currentStar = star;
    }

    despawnStar () {
        // 销毁星星
        this._starPool.put(this._currentStar);
    }

    getNewStarPosition () {
        // 星星随机位置
        let randX = Math.random() * this.starLimitRadius * 2 - this.starLimitRadius;
        let randY = Math.random() * this.groundY + 0.5;
        let randZ = Math.random() * this.starLimitRadius * 2 - this.starLimitRadius;
        return new Vec3(randX, randY, randZ);
    }

    gainSocre () {
        // 分数增加
        this._score += 1;
        let label: Label = new Label();
        label = this.scoreDisplay.getComponent(Label)!;
        label.string = 'Score: ' + this._score;

        // 播放音效
        this._audioSource.playOneShot(this.pickAudio, 1);
    }

    resetScore () {
        // 分数归零
        this._score = 0;
        let label: Label = new Label();
        label = this.scoreDisplay.getComponent(Label)!;
        label.string = 'Score: ' + this._score;
    }

    startGame () {
        // 开启脚本
        this.enabled = true;

        // 按钮消失
        this.startBtn.active = false;
        
        // 初始化计分
        this.resetScore();

        // 设置主角位置
        this.monster.setPosition(Vec3.ZERO);

        // 开启监听并开始跳动
        this.monster.getComponent(Player)?.setInputControl();
        this.monster.getComponent(Player)?.runJumpAction();

        // 生成星星
        this.spawnNewStar();
    }

    gameOver () {
        // 按钮出现
        this.startBtn.active = true;

        // 取消监听并停止跳动
        this.monster.getComponent(Player)?.unsetInputControl();
        this.monster.getComponent(Player)?.stopAction();

        // 回收星星
        this._starPool.put(this._currentStar);
     }

    update (deltaTime: number) {
        // 如果星星缩小到0，则游戏结束
        if (this._currentStar.scale.x <= 0) {
            this.gameOver();
        }
    }
}
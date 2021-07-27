
import { _decorator, macro, tween, AudioClip, Component, systemEvent, SystemEvent, EventMouse, Vec3, AudioSource, EventKeyboard, Vec2, Tween, TweenSystem } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    // 跳跃时间
    @property
    public jumpDuration = 0;
    
    // 形变时间
    @property
    public squashDuration = 0;

    // 移动速度
    @property
    public moveSpeed = 0;

    // 活动半径
    @property
    public playerLimitRadius = 3;

    // 跳跃音效
    @property({type: AudioClip})
    public jumpAudio: AudioClip = null!;

    // 音频组件
    private _audioSource = new AudioSource();

    // 跳跃缓动
    private _jumpTween = new Tween();
    
    // 判断是否正在移动
    private _isMoving = false;
    private _xDir = 0;
    private _zDir = 0;

    start () {

    }

    runJumpAction () {
        // 跳起
        let jumpUp = tween()
                     .to(this.squashDuration, { scale: new Vec3(0.5, 0.6, 0.5)}, { easing: 'quadOut' })
                     .by(this.jumpDuration, { position: new Vec3(0, 2.5, 0) }, { easing: 'quadOut' })
                     .call(() => { this._audioSource?.playOneShot(this.jumpAudio, 1); })
                     .union();
        
        // 下落
        let jumpDown = tween()
                       .to(this.squashDuration, { scale: new Vec3(0.5, 0.4, 0.5)}, { easing: 'quadIn' })
                       .by(this.jumpDuration, { position: new Vec3(0, -2.5, 0) }, { easing: 'quadIn' })
                       .union()

        // 顺序缓动
        let sequence = tween()
                       .sequence(jumpUp, jumpDown)

        // 开始动作
        this._jumpTween = tween(this.node).repeatForever(sequence).start();
    }

    stopAction () {
        this._jumpTween.stop();
        this._isMoving = false;
    }

    setInputControl () {
        // 事件监听
        systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        systemEvent.on(SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    unsetInputControl () {
        // 取消监听
        systemEvent.off(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        systemEvent.off(SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown (event: EventKeyboard) {  
        this._isMoving = true;

        switch(event.keyCode) {
            case macro.KEY.a:
                this._xDir = -1;
                break;
            
            case macro.KEY.d:
                this._xDir = 1;
                break;

            case macro.KEY.w:
                this._zDir = -1;
                break;

            case macro.KEY.s:
                this._zDir = 1;
                break;
        }
        
        // 前进方向
        let dir = new Vec2(this._xDir, this._zDir);
        // 计算弧度
        let radian = dir.signAngle(new Vec2(1, 0));
        // 秋欧拉角
        let angle = radian / Math.PI * 180 + 90
        // 旋转主角
        this.node.setRotationFromEuler(0, angle, 0);
    }

    onKeyUp (event: EventKeyboard) {
        this._isMoving = false;

        switch(event.keyCode) {
            case macro.KEY.a:
                this._xDir = 0;
                break;
            
            case macro.KEY.d:
                this._xDir = 0;
                break;

            case macro.KEY.w:
                this._zDir = 0;
                break;

            case macro.KEY.s:
                this._zDir = 0;
                break;
        }
    }

    update (deltaTime: number) {
        if (this._isMoving) {
            // 移动主角
            this.node.setPosition(this.node.position.add(new Vec3(this._xDir*this.moveSpeed*deltaTime, 0, this._zDir*this.moveSpeed*deltaTime)))
            
            // 获取位置
            let x = this.node.position.x;
            let y = this.node.position.y;
            let z = this.node.position.z;
            
            // 计算比例
            let len = new Vec2(x, z).length();
            let ratio = len / this.playerLimitRadius;

            // 限制主角
            if (ratio > 1) {
                this.node.setPosition(x/ratio, y, z/ratio);
            }
        }
    }
}

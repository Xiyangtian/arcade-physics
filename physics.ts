namespace SpriteKind {
    export const Platform = SpriteKind.create()
}
//% color="#268388" icon="\uf110" block="物理"
//% groups='["物理效果", "物理参数", "图块物理"]'
namespace physics {
    let physicsSprites: Sprite[] = []
    let noJumpSprites: Sprite[] = []
    let semiSolids: Image[] = []
    let ladders: Image[] = []
    let wallJumpTiles: Image[] = []
    let iceTiles: Image[] = []
    let ignore: Image[] = []
    let right: Image[] = []
    let left: Image[] = []
    let groundedSprites: Sprite[] = []
    let pathPlatforms: Sprite[] = []
    let pathStartRows: number[] = []
    let pathStartCols: number[] = []
    let pathEndRows: number[] = []
    let pathEndCols: number[] = []
    let pathSpeeds: number[] = []
    let pathDirs: number[] = []
    let platformSpriteData: any = {}

    let MAX_STEP_UP = 1
    let GRAVITY_NORMAL = 500
    let TERMINAL_VELOCITY = 250
    let JUMP = -185
    let GROUND_FRICTION = 0.5
    let ICE_FRICTION = 0.98
    let controlledSprites: Sprite[] = []
    let controlledSpeeds: number[] = []
    let MAX_JUMPS = 1
    let spriteJumps: number[] = []
    let spriteWallJumpCooldowns: number[] = []

    //% block="梯子列表"
    //% weight=-10
    //% group="物理参数"
    export function ladderList() { return ladders }

    //% block="冰面列表"
    //% weight=-20
    //% group="物理参数"
    export function iceList() { return iceTiles }

    //% block="重力"
    //% weight=50
    //% group="物理参数"
    export function gravity() { return GRAVITY_NORMAL }

    //% block="能上台阶的像素格数"
    //% weight=20
    //% group="物理参数"
    export function stepUp() { return MAX_STEP_UP }

    //% block="跳跃力度"
    //% weight=40
    //% group="物理参数"
    export function jump() { return JUMP }

    //% block="设置能上台阶的像素格数为 %n"
    //% n.defl=1
    //% weight=90
    //% group="物理参数"
    export function maxPixelsUp(n: number) { MAX_STEP_UP = n }

    //% block="设置 %sprite 为路径移动平台 从 %startLoc 到 %endLoc 速度 %speed"
    //% sprite.shadow="variables_get"
    //% startLoc.shadow="mapgettile"
    //% endLoc.shadow="mapgettile"
    //% speed.defl=60
    //% weight=35
    //% group="物理效果"
    export function setAsPathPlatform(sprite: Sprite, startLoc: tiles.Location, endLoc: tiles.Location, speed: number) {
        sprite.setKind(SpriteKind.Platform)
        sprite.setFlag(SpriteFlag.Ghost, true)
        let startRow = startLoc.row
        let startCol = startLoc.column
        let endRow = endLoc.row
        let endCol = endLoc.column
        let index = pathPlatforms.indexOf(sprite)
        if (index == -1) {
            pathPlatforms.push(sprite)
            pathStartRows.push(startRow)
            pathStartCols.push(startCol)
            pathEndRows.push(endRow)
            pathEndCols.push(endCol)
            pathSpeeds.push(Math.abs(speed))
            pathDirs.push(1)
        } else {
            pathStartRows[index] = startRow
            pathStartCols[index] = startCol
            pathEndRows[index] = endRow
            pathEndCols[index] = endCol
            pathSpeeds[index] = Math.abs(speed)
            pathDirs[index] = 1
        }
        sprite.x = startCol * 16 + 8
        sprite.y = startRow * 16 + 8
    }

    //% block="设置重力加速度为 %n"
    //% n.defl=500
    //% weight=55
    //% group="物理参数"
    export function gravityAy(n: number) { GRAVITY_NORMAL = n }

    //% block="设置跳跃力度为 %n"
    //% n.defl=185
    //% weight=80
    //% group="物理参数"
    export function jumpVy(n: number) { JUMP = -n }

    //% block="设置最大跳跃段数为 %n"
    //% n.defl=1
    //% n.min=1
    //% weight=30
    //% group="物理效果"
    export function setMaxJumps(n: number) { MAX_JUMPS = n }

    //% block="最大跳跃段数"
    //% weight=30
    //% group="物理参数"
    export function maxJumps() { return MAX_JUMPS }

    //% block="设置地面摩擦力保留比例为 %n"
    //% n.defl=0.5
    //% n.min=0 n.max=1
    //% weight=70
    //% group="物理参数"
    export function setGroundFriction(n: number) { GROUND_FRICTION = n }

    //% block="设置冰面摩擦力保留比例为 %n"
    //% n.defl=0.98
    //% n.min=0 n.max=1
    //% weight=60
    //% group="物理参数"
    export function setIceFriction(n: number) { ICE_FRICTION = n }

    //% block="地面摩擦力保留比例"
    //% weight=10
    //% group="物理参数"
    export function groundFriction() { return GROUND_FRICTION }

    //% block="冰面摩擦力保留比例"
    //% weight=0
    //% group="物理参数"
    export function iceFriction() { return ICE_FRICTION }

    //% block="使用物理移动控制 %sprite 速度 %speed"
    //% sprite.shadow="variables_get"
    //% sprite.defl="mySprite"
    //% speed.defl=100
    //% weight=90
    //% group="物理效果"
    export function moveWithPhysics(sprite: Sprite, speed: number) {
        let idx = controlledSprites.indexOf(sprite)
        if (idx == -1) {
            controlledSprites.push(sprite)
            controlledSpeeds.push(speed)
        } else {
            controlledSpeeds[idx] = speed
        }
    }


    //% block="设置半实心图块为 %list"
    //% list.shadow="lists_create_with"
    //% list.defl="tileset_tile_picker"
    //% weight=100
    //% group="图块物理"
    export function setSemiSolids(list: Image[]) { semiSolids = list }

    //% block="设置忽略碰撞图块为 %list"
    //% list.shadow="lists_create_with"
    //% list.defl="tileset_tile_picker"
    //% weight=90
    //% group="图块物理"
    export function setIgnore(list: Image[]) { ignore = list }

    //% block="设置右侧单向墙图块为 %list"
    //% list.shadow="lists_create_with"
    //% list.defl="tileset_tile_picker"
    //% weight=80
    //% group="图块物理"
    export function setRight(list: Image[]) {
        for (let valor of list) {
            right.push(valor)
        }
    }

    //% block="设置左侧单向墙图块为 %list"
    //% list.shadow="lists_create_with"
    //% list.defl="tileset_tile_picker"
    //% weight=70
    //% group="图块物理"
    export function setLeft(list: Image[]) {
        for (let valor of list) {
            left.push(valor)
        }
    }

    //% block="设置梯子图块为 %list"
    //% list.shadow="lists_create_with"
    //% list.defl="tileset_tile_picker"
    //% weight=60
    //% group="图块物理"
    export function setLadders(list: Image[]) { ladders = list }

    //% block="设置蹬墙跳图块为 %list"
    //% list.shadow="lists_create_with"
    //% list.defl="tileset_tile_picker"
    //% weight=50
    //% group="图块物理"
    export function setWallJumpTiles(list: Image[]) { wallJumpTiles = list }

    //% block="设置冰面图块为 %list"
    //% list.shadow="lists_create_with"
    //% list.defl="tileset_tile_picker"
    //% weight=40
    //% group="图块物理"
    export function setIce(list: Image[]) { iceTiles = list }

    //% block="为 %sprite 添加物理效果"
    //% sprite.shadow="variables_get"
    //% sprite.defl="mySprite"
    //% weight=100
    //% group="物理效果"
    export function addPhysics(sprite: Sprite) {
        if (physicsSprites.indexOf(sprite) == -1) {
            physicsSprites.push(sprite)
            spriteJumps.push(0)
            spriteWallJumpCooldowns.push(0)
        }

        controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
            for (let i = 0; i < physicsSprites.length; i++) {
                let s = physicsSprites[i]
                let onLadder = isTileInList(s.x, s.y, ladders)
                if (onLadder) continue

                if (isTileInList(s.right + 2, s.y, wallJumpTiles)) {
                    s.vy = JUMP - 20; s.vx = -100; s.x -= 3
                    spriteWallJumpCooldowns[i] = 8
                    scene.cameraShake(2, 100)
                } else if (isTileInList(s.left - 2, s.y, wallJumpTiles)) {
                    s.vy = JUMP - 20; s.vx = 100; s.x += 3
                    spriteWallJumpCooldowns[i] = 8
                    scene.cameraShake(2, 100)
                } else if (spriteJumps[i] < MAX_JUMPS) {
                    s.vy = JUMP; s.y -= 2
                    spriteJumps[i]++
                    scene.cameraShake(2, 100)
                }
            }
        })
    }

    //% block="为 %sprite 添加无跳跃物理效果"
    //% sprite.shadow="variables_get"
    //% sprite.defl="mySprite"
    //% weight=95
    //% group="物理效果"
    export function addNoJumpPhysics(sprite: Sprite) {
        if (noJumpSprites.indexOf(sprite) == -1) noJumpSprites.push(sprite)
    }

    scene.onHitWall(SpriteKind.Platform, function (sprite, location) {
        sprite.vx = sprite.vx * -1
    })

    game.onUpdate(function () {
        groundedSprites = []
        for (let s of physicsSprites) {
            let idx = physicsSprites.indexOf(s)
            if (idx != -1 && spriteWallJumpCooldowns[idx] > 0) {
                spriteWallJumpCooldowns[idx]--
            }

            let onLadder = isTileInList(s.x, s.y, ladders)
            let onIce = isTileInList(s.x, s.bottom + 2, iceTiles)
            let onGround = s.vy >= 0 && checkSolid(s.x, s.bottom, false)

            // --- 1. GESTIÓN DE GRAVEDAD (SIN REBOTE EN ESCALERAS) ---
            if (onLadder) {
                s.ay = 0; s.vx *= 0.6
                if (controller.up.isPressed()) s.vy = -85
                else if (controller.down.isPressed()) s.vy = 85
                else s.vy = 0
            } else {
                s.ay = GRAVITY_NORMAL
                if (onIce) s.vx *= ICE_FRICTION
                else if (onGround) s.vx *= GROUND_FRICTION
            }

            // 速度过低时直接归零，避免百分比衰减永远滑不到 0
            if (Math.abs(s.vx) < 5) s.vx = 0

            // --- 2. DETECCIÓN HORIZONTAL Y RAMPAS (MANTIENE COLISIÓN) ---
            if (Math.abs(s.vx) > 0.1 && !onLadder) {
                let isRight = s.vx > 0
                let checkX = isRight ? s.right + 1 : s.left - 1
                let wallHit = false

                for (let h = s.top + 2; h < s.bottom - (MAX_STEP_UP + 1); h += 4) {
                    if (checkSolid(checkX, h, true)) { wallHit = true; break }
                }

                if (wallHit) {
                    s.vx = 0
                    let col = Math.floor(checkX / 16)
                    if (isRight) s.right = (col * 16) - 1
                    else s.left = (col * 16) + 16
                } else if (checkSolid(checkX, s.bottom - 1, true)) {
                    // Lógica de rampa: Sube píxel a píxel si detecta dibujo sólido
                    for (let step = 1; step <= MAX_STEP_UP; step++) {
                        if (!checkSolid(checkX, s.bottom - step - 1, true)) {
                            s.bottom -= step; break
                        }
                    }
                }
            }

            // --- 3. ANCLAJE AL SUELO (GROUNDING - CERO REBOTE) ---
            if (!onLadder && s.vy >= 0) {
                let bestY = -1
                let pointsX = [s.left + 2, s.right - 2, s.x]
                for (let x of pointsX) {
                    for (let offset = -1; offset <= 4; offset++) {
                        let cy = s.bottom + offset
                        if (checkSolid(x, cy, false)) {
                            if (bestY == -1 || cy < bestY) bestY = cy; break
                        }
                    }
                }
                if (bestY != -1 && s.bottom >= bestY - 6) {
                    s.bottom = bestY; s.vy = 0
                    let idx = physicsSprites.indexOf(s)
                    if (idx != -1) spriteJumps[idx] = 0
                }
            }

            // --- 4. DETECCIÓN DE TECHO (SUAVE) ---
            if (s.vy < 0 && !onLadder) {
                if (checkSolid(s.x, s.top - 1, true) || checkSolid(s.left + 2, s.top - 1, true) || checkSolid(s.right - 2, s.top - 1, true)) {
                    s.vy = 12; s.top = (Math.floor(s.top / 16) * 16) + 16
                }
            }
            s.vy = Math.min(s.vy, TERMINAL_VELOCITY)

            // --- 在地面上检测 ---
            if (s.vy >= 0 && checkSolid(s.x, s.bottom, false)) {
                groundedSprites.push(s)
            }
        }

        // --- 无跳跃物理效果处理 ---
        for (let s of noJumpSprites) {
            let onGround = s.vy >= 0 && checkSolid(s.x, s.bottom, false)

            s.ay = GRAVITY_NORMAL

            // 无跳跃精灵：空中保留原水平速度，地面不受摩擦力影响
            // 但始终保留碰撞和斜坡检测
            if (Math.abs(s.vx) > 0.1) {
                let isRight = s.vx > 0
                let checkX = isRight ? s.right + 1 : s.left - 1
                let wallHit = false

                for (let h = s.top + 2; h < s.bottom - (MAX_STEP_UP + 1); h += 4) {
                    if (checkSolid(checkX, h, true)) { wallHit = true; break }
                }

                if (wallHit) {
                    s.vx = 0
                    let col = Math.floor(checkX / 16)
                    if (isRight) s.right = (col * 16) - 1
                    else s.left = (col * 16) + 16
                } else if (checkSolid(checkX, s.bottom - 1, true)) {
                    for (let step = 1; step <= MAX_STEP_UP; step++) {
                        if (!checkSolid(checkX, s.bottom - step - 1, true)) {
                            s.bottom -= step; break
                        }
                    }
                }
            }

            // 地面吸附
            if (s.vy >= 0) {
                let bestY = -1
                let pointsX = [s.left + 2, s.right - 2, s.x]
                for (let x of pointsX) {
                    for (let offset = -1; offset <= 4; offset++) {
                        let cy = s.bottom + offset
                        if (checkSolid(x, cy, false)) {
                            if (bestY == -1 || cy < bestY) bestY = cy; break
                        }
                    }
                }
                if (bestY != -1 && s.bottom >= bestY - 6) {
                    s.bottom = bestY; s.vy = 0
                }
            }

            s.vy = Math.min(s.vy, TERMINAL_VELOCITY)

            if (s.vy >= 0 && checkSolid(s.x, s.bottom, false)) {
                groundedSprites.push(s)
            }
        }

        // --- 物理移动控制 ---
        for (let i = 0; i < controlledSprites.length; i++) {
            let s = controlledSprites[i]
            let idx = physicsSprites.indexOf(s)
            if (idx == -1) continue
            if (spriteWallJumpCooldowns[idx] > 0) continue
            let pressingLeft = controller.left.isPressed()
            let pressingRight = controller.right.isPressed()
            let speed = controlledSpeeds[i]
            let onGround = groundedSprites.indexOf(s) != -1
            let onIce = isTileInList(s.x, s.bottom + 2, iceTiles)
            let friction = onIce ? ICE_FRICTION : GROUND_FRICTION

            if (pressingLeft && pressingRight) {
                // 同时按：保持当前速度
            } else if (pressingLeft) {
                s.vx = -speed
            } else if (pressingRight) {
                s.vx = speed
            } else {
                if (onGround) {
                    s.vx *= friction
                    if (Math.abs(s.vx) < 5) s.vx = 0
                } else {
                    s.vx = 0
                }
            }
        }
    })

    export function isTileInList(x: number, y: number, list: Image[]): boolean {
        let col = Math.floor(x / 16); let row = Math.floor(y / 16)
        if (col < 0 || row < 0) return false
        let t = tiles.getTileAt(col, row)
        return t && list.indexOf(t) != -1
    }

    export function checkSolid(x: number, y: number, ignoreSemi: boolean): boolean {
        let col = Math.floor(x / 16); let row = Math.floor(y / 16)
        // Seguridad de límites sin usar getTilemap (error de consola eliminado)
        if (col < 0 || row < 0 || col >= 2000 || row >= 2000) return false

        let t = tiles.getTileAt(col, row)
        if (!t || ladders.indexOf(t) != -1) return false
        if (ignoreSemi && semiSolids.indexOf(t) != -1) return false
        if (ignore.indexOf(t) != -1) return false
        if (right.indexOf(t) != -1) return false
        if (left.indexOf(t) != -1) return false
        // DETECCIÓN POR PÍXEL: Obliga al personaje a no atravesar rampas dibujadas
        let px = Math.floor(x % 16); let py = Math.floor(y % 16)
        let hasPixel = t.getPixel(px, py) != 0
        let isWall = tiles.tileAtLocationIsWall(tiles.getTileLocation(col, row))

        return hasPixel || isWall
    }

    //% block="%sprite 在地面上"
    //% sprite.shadow="variables_get"
    //% sprite.defl="mySprite"
    //% weight=100
    //% group="物理参数"
    export function onGround(sprite: Sprite): boolean {
        return groundedSprites.indexOf(sprite) != -1
    }

    game.onUpdate(function () {
        let dt = game.eventContext().deltaTimeMillis
        if (dt == 0) dt = 1
        dt = dt / 1000
        for (let v of right) {
            for (let valor of tiles.getTilesByType(v)) {
                for (let sprite of physicsSprites)
                    if (sprite.tilemapLocation().column < valor.column) {
                        tiles.setWallAt(valor, true)
                    } else {
                        tiles.setWallAt(valor, false)
                    }
            }
        }
        for (let v of left) {
            for (let valor of tiles.getTilesByType(v)) {
                for (let sprite of physicsSprites)
                    if (sprite.tilemapLocation().column > valor.column) {
                        tiles.setWallAt(valor, true)
                    } else {
                        tiles.setWallAt(valor, false)
                    }
            }
        }
        // 每帧开始时清除上一帧的平台标记，后续检测中会重新设置
        for (let sid of Object.keys(platformSpriteData)) {
            platformSpriteData[sid].onPlatform = false
        }

        // --- 路径移动平台 ---
        for (let i = 0; i < pathPlatforms.length; i++) {
            let platform = pathPlatforms[i]
            let startX = pathStartCols[i] * 16 + 8
            let startY = pathStartRows[i] * 16 + 8
            let endX = pathEndCols[i] * 16 + 8
            let endY = pathEndRows[i] * 16 + 8
            let speed = pathSpeeds[i]
            let targetX = pathDirs[i] == 1 ? endX : startX
            let targetY = pathDirs[i] == 1 ? endY : startY
            let dx = targetX - platform.x
            let dy = targetY - platform.y
            let dist = Math.sqrt(dx * dx + dy * dy)
            let moveX = 0
            let moveY = 0
            if (dist < 1) {
                platform.x = targetX
                platform.y = targetY
                pathDirs[i] = -pathDirs[i]
                targetX = pathDirs[i] == 1 ? endX : startX
                targetY = pathDirs[i] == 1 ? endY : startY
                dx = targetX - platform.x
                dy = targetY - platform.y
                dist = Math.sqrt(dx * dx + dy * dy)
            }
            if (dist > 0) {
                let moveDist = Math.min(dist, speed * dt)
                moveX = (dx / dist) * moveDist
                moveY = (dy / dist) * moveDist
                if (dt > 0) {
                    platform.vx = moveX / dt
                    platform.vy = moveY / dt
                } else {
                    platform.vx = 0
                    platform.vy = 0
                }
            } else {
                platform.vx = 0
                platform.vy = 0
            }
        }

        // --- 5. PLATAFORMAS MÓVILES Y ASCENSORES ---
        for (let s of physicsSprites) {
            for (let platform of sprites.allOfKind(SpriteKind.Platform)) {

                // 从上方落到平台上
                if (s.bottom >= platform.top - 2 && s.bottom <= platform.top + 4 &&
                    s.right > platform.left && s.left < platform.right) {

                    let sid = s.id
                    let data = platformSpriteData[sid]
                    if (!data || data.platform !== platform) {
                        data = { platform: platform, offsetX: s.x - platform.x, onPlatform: true }
                        platformSpriteData[sid] = data
                    } else {
                        data.onPlatform = true
                    }

                    // 站定时使用相对位置锁定消除抖动；走动时更新偏移并使用速度叠加
                    if (Math.abs(s.vx) > 1) {
                        data.offsetX = s.x - platform.x
                        s.x += platform.vx * dt
                    } else {
                        s.x = platform.x + data.offsetX
                    }

                    s.bottom = platform.top
                    s.vy = platform.vy

                    if (groundedSprites.indexOf(s) == -1) {
                        groundedSprites.push(s)
                    }

                    // 站在平台上也重置跳跃段数
                    let idx = physicsSprites.indexOf(s)
                    if (idx != -1) spriteJumps[idx] = 0
                }

                // 从下方跳到平台底部（平台设为Ghost后需手动处理）
                if (s.vy < 0 && s.top <= platform.bottom + 2 && s.top >= platform.bottom - 4 &&
                    s.right > platform.left && s.left < platform.right) {
                    s.top = platform.bottom
                    s.vy = 0
                }
            }
        }

        // 清除不在平台上的角色的数据
        for (let sid of Object.keys(platformSpriteData)) {
            if (!platformSpriteData[sid].onPlatform) {
                delete platformSpriteData[sid]
            }
        }
    })

}

import Foundation

// This is rough and, for now, relies on the script being run in the root - I'll fix this later
let input = try! String.init(contentsOfFile: "src/day1/input.txt", encoding: .utf8)

func solvePart1() -> Int {
    let lines = input.components(separatedBy: "\n").filter({ !$0.isEmpty })
    let blocks = lines.map { $0.components(separatedBy: "   ") }

    var list1 = blocks.map { Int($0[0])! }
    var list2 = blocks.map { Int($0[1])! }

    list1.sort()
    list2.sort()

    let solution = (0...list1.count - 1).reduce(into: 0) { (acc, next) in
        acc += abs(list1[next] - list2[next])
    }

    return solution
}

let part1 = solvePart1()

// swift src/day1/Sources/main.swift
print("Total distance: \(part1)")

